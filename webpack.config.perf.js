/* eslint-env node */

const TerserPlugin = require('terser-webpack-plugin');

const baseConfig = require('./webpack.config');

module.exports = Object.assign({}, baseConfig, {
  mode: 'production',
  devtool: 'source-map',

  resolve: Object.assign({}, baseConfig.resolve, {
    alias: Object.assign({}, baseConfig.resolve.alias, {
      'react-dom$': 'react-dom/profiling',
    }),
  }),

  optimization: {
    moduleIds: 'named',
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
          mangle: false,
        },
      }),
    ],
  },

  module: {
    rules: [{ test: /\.(t|j)sx?$/, loader: 'babel-loader' }],
  },

  devServer: Object.assign({}, baseConfig.devServer, {
    hot: false,
    liveReload: false,
    webSocketServer: false,
  }),
});
