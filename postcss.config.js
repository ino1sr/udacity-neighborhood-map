const path = require("path");

module.exports = (ctx) => {
  return {
    plugins: [
      require("postcss-import")({
        path: path.join(__dirname, "src")
      }),
      require("postcss-url")(),
      require("postcss-cssnext")({
        browsers: ["last 3 versions"]
      })
    ]
  }
}
