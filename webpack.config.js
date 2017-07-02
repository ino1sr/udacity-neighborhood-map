let path = require("path");
let CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/app.js'),
  context: path.join(__dirname),
  output: {
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "static" }
    ])
  ],
  devServer: {
    inline: false,
    publicPath: '/',
    disableHostCheck: true,
    contentBase: path.resolve(__dirname, "build")
  }
}
