# Udacity neighborhood map project

## Run the project in development mode

```shell
npm install
npm run server
```

This will start the webpack development server on port 8080. It will
listen on all interfaces to allow connection from remote devices (mobile...).

## Tools

### Webpack

For processing and assembling JS, CSS and other assets, Webpack is used.

It will compile all resources to a single `bundle.js` file that can be loaded
within the `index.html` file.

### Babel

To allow use of modern JavaScript, babel is used to transform modern
JavaScript to "old" JavaScript that can be run within the browsers.

### ESLint

To enforce a consistent coding style, `eslint` is used. It will report style
errors.

### PostCSS

To automatically add browser prefixes and ensure a nice and tidy CSS, `postcss`
is used as CSS post processor (invoked by webpack).

## Notes

### Avoiding FOUC

After using webpack, I realized that the style were applied only after the
webpack bundle was loaded, which was causing a [flash of unstyled content][1].
To work around this issue, I added a `loading-wrapper` element that is styled
directly within the `.html` file. In the `app.css` I re-style it and the rest
of the page to create a "fade in" transition of the app.

### Wikipedia API

When a marker is clicked, I search for wikipedia page in the vicinity
of the marker. I thought it was cooler to not hardcode the wikipedia page id
in `locations.json`.

[1]: https://en.wikipedia.org/wiki/Flash_of_unstyled_content
