// Main application entry point, used as webpack entry

// Google API key: AIzaSyBFPCWq8IhXt58hnuSbRqgXT-WyMr-ZcqQ

require("./app.css");

import * as ko from "knockout";
import * as axios from "axios";


class ViewModel {
  constructor() {
    this.loadingLocations = ko.observable(true);
    this.loadingError = ko.observable(null);
    this.allLocations = ko.observableArray([]);

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
    this.filter.subscribe(() => this.menuVisible(true))
  }

  toggleMenu() {
    this.menuVisible(!this.menuVisible());
  }

  loadLocations() {
    this.loadingError(null);
    axios.get("/locations.json")
      .then((response) => {
        // Convert array locations into objects
        this.allLocations(response.data.locations.map((loc) => {
          return {
            name: loc[0],
            lat: loc[1],
            lng: loc[2],
          };
        }));
      })
      .catch((error) => {
        this.loadingError(error.message);
      })
      .then(() => {
        this.loadingLocations(false);
      });
  }
}

const model = new ViewModel();

ko.applyBindings(model);


model.loadLocations();
