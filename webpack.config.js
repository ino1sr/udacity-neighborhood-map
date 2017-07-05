let path = require("path");
let CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/app.js'),
  context: path.join(__dirname),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: "static" }
    ])
  ],
  devServer: {
    publicPath: '/',
    disableHostCheck: true,
    contentBase: path.resolve(__dirname, "build")
  }
}
