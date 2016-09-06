var path = require('path');
var webpack = require("webpack");
module.exports = {
  entry: './public/scripts/main.js',
  output: {
    path: './public/scripts',
    filename: 'bundle.js'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js'],
    modulesDirectories:['node_modules']
  },
  module: {
    loaders: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  node: {
    fs:"empty"
  },
  // plugins:[
  //   new webpack.IgnorePlugin(new RegExp("/(node_modules|nodemailer)/"))
  // ],
  watch:"true"
}
