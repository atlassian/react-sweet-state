/* eslint-env node */

const baseConfig = require('./webpack.config');

module.exports = Object.assign({}, baseConfig, {
  mode: 'production',
  devtool: 'source-map',

  module: {
    rules: [{ test: /\.(t|j)sx?$/, loader: 'babel-loader' }],
  },
});
