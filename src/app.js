// Main application entry point, used as webpack entry

// Google API key: AIzaSyBFPCWq8IhXt58hnuSbRqgXT-WyMr-ZcqQ

require("./app.css");

import * as ko from "knockout";


class ViewModel {
  constructor() {
    this.loadingLocations = ko.observable(true);
  }
}

const model = new ViewModel();

ko.applyBindings(model);

setTimeout(() => model.loadingLocations(false), 1000);
