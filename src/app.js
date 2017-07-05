/* global google */

// Main application entry point, used as webpack entry


const GOOGLE_MAP_API_KEY = "AIzaSyBFPCWq8IhXt58hnuSbRqgXT-WyMr-ZcqQ";


require("./app.css");

import * as ko from "knockout";
import * as axios from "axios";



class ViewModel {
  constructor() {
    this.loadingLocations = ko.observable(true);
    this.loadingError = ko.observable(null);
    this.allLocations = ko.observableArray([]);
    this.selectedLocation = ko.observable(null);

    this.filter = ko.observable("");

    /* Debounce filtering */
    this.filter.extend({ rateLimit: 500 });

    this.ready = ko.computed(() => {
      return !this.loadingError() && !this.loadingLocations();
    });

    this.locations = ko.computed(() => {
      const filter = this.filter().toLowerCase();

      const locs = this.allLocations()
        .filter((loc) => {
          return loc.name.toLowerCase().indexOf(filter) >= 0;
        });

      return locs.sort((a, b) => {
        return a.name
          .toLowerCase()
          .localeCompare(b.name.toLowerCase());
      });
    });

    this.menuVisible = ko.observable(false);

    /* When we search in the field, ensure the results are visible */
    this.filter.subscribe(() => {
      this.menuVisible(true);
      this.infoWindow.close();
    });

    /* Update markers when location are filtered */
    this.locations.subscribe(() => {
      this.selectedLocation(null);
      this.updateMarkers();
    });

    /* Declare binding callbacks as arrow function to ensure
     * this is the correct object
     */
    this.selectLocation = (loc) => {
      if (this.selectedLocation()) {
        this.selectedLocation().marker.setAnimation(null)
      }
      this.selectedLocation(loc)

      loc.marker.setAnimation(google.maps.Animation.BOUNCE)
      setTimeout(() => loc.marker.setAnimation(null), 2100)
      this.map.setCenter(loc)

      this.openInfoWindow(loc)
    }

    this.openInfoWindow = (location) => {
      this.infoWindow.setPosition(location)
      this.infoWindow.setContent(`
        <div class="info-content">
          <div class="info-name">${location.name}</div>
          <div class="info-wiki">Loading...</div>
        </div>
      `)
      this.infoWindow.open(this.map)
      this.loadWikipediaInfo()
    }

    this.toggleMenu = () => {
      this.menuVisible(!this.menuVisible());
    }

    this.loadWikipediaInfo = () => {
      const loc = this.selectedLocation()

      if (!loc) {
        return
      }

      const render = () => {
        if (!loc.wikipediaInfo) {
          this.infoWindow.setContent(`
            <div class="info-content">
              <div class="info-name">${loc.name}</div>
              <div class="info-wiki">No wikipedia page found.</div>
            </div>
          `)
        } else {
          const img = loc.wikipediaInfo.thumbnail.source
          const pid = loc.wikipediaInfo.pageid
          const title = loc.wikipediaInfo.title
          const extract = loc.wikipediaInfo.extract
          this.infoWindow.setContent(`
            <div class="info-content">
              <div class="info-name">${loc.name}</div>
              <div class="info-wiki">
                <img class="info-wiki-image" src="${img}">
                <div class="info-wiki-text">
                  <div class="info-wiki-title">
                  ${title}
                  </div>
                  <div class="info-wiki-extract">
                  ${extract}
                  </div>
                  <div class="info-wiki-attribution">
                    Extracted from wikipedia.<br>
                    <a href="https://en.wikipedia.org/?curid=${pid}" target="_blank">
                      View on wikipedia.
                    </a>
                  </div>
                </div>
              </div>
            </div>
          `)
        }
      }

      if (loc.wikipediaInfo === undefined) {
        /* Find the wiki page within 100meter of the place */
        const url = "https://en.wikipedia.org/w/api.php?origin=*&" +
                    "format=json&action=query&" +
                    "prop=pageimages|info|extracts&exlimit=1&explaintext=1&" +
                    "exintro=1&generator=geosearch&ggsradius=200&" +
                    `ggscoord=${loc.lat}|${loc.lng}&pithumbsize=100`

        axios.get(url)
          .then((response) => {
            for (let k in response.data.query.pages) {
              const page =response.data.query.pages[k]
              if (page.index === 0) {
                loc.wikipediaInfo = page
              }
            }
          }).catch(() => {
            loc.wikipediaInfo = null
          }).then(render)
      } else {
        render()
      }
    }

    this.loadLocations = () => {
      this.loadingError(null);
      axios.get("locations.json")
        .then((response) => {
          // Convert array locations into objects
          this.allLocations(response.data.locations.map((loc) => {
            return {
              name: loc[0],
              lat: loc[1],
              lng: loc[2],
            };
          }));
          this.loadMap();
        })
        .catch((error) => {
          this.loadingError(error.message);
        })
        .then(() => {
          this.loadingLocations(false);
        });
    }

    this.loadMap = () => {
      const el = document.querySelector(".map");

      /* Create a global function to be called by google map API as webpack
       * scope is not global
       */
      window.initMap = () => {
        this.bounds = new google.maps.LatLngBounds();

        this.markers = [];

        this.allLocations().forEach((loc) => {
          this.bounds.extend(loc);
        });

        this.map = new google.maps.Map(el, {
          zoom: 4,
          center: this.bounds.getCenter()
        });
        this.map.fitBounds(this.bounds);

        this.map.addListener("click", () => {
          this.menuVisible(false);
        });

        this.allLocations().forEach((loc) => {
          const m = new google.maps.Marker({
            position: loc,
            map: this.map
          });
          loc.marker = m;
          m.addListener("click", () => {
            this.selectLocation(loc)
          })
          this.markers.push(m);
        });

        this.updateMarkers();

        this.infoWindow = new google.maps.InfoWindow({
          pixelOffset: { width: 0, height: -40}
        })
      };

      const gmapScript = document.createElement("script");
      const src =`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API_KEY}&callback=initMap`;

      gmapScript.setAttribute("defer", true);
      gmapScript.setAttribute("src", src);

      document.head.appendChild(gmapScript);
    }

    this.updateMarkers = () => {
      if (!this.map) {
        return;
      }

      this.markers.forEach((m) => {
        m.setVisible(false);
      });

      this.locations().forEach((loc) => {
        loc.marker.setVisible(true);
      });

    }
  }
}

const model = new ViewModel();

ko.applyBindings(model);

model.loadLocations();

