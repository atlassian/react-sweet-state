/* eslint-env node */

const { lstatSync, readdirSync } = require('fs');
const { resolve, basename } = require('path');

// This function generates configuration for files in the
// ./src/examples/ folder
const generateExampleEntries = function() {
  const src = './examples';

  // Get all subdirectories in the ./src/apps,
  // so we can just add a new folder there and
  // have automatically the entry points updated

  const getDirectories = source =>
    readdirSync(source)
      .map(name => resolve(source, name))
      .filter(s => lstatSync(s).isDirectory());

  const exampleDirs = getDirectories(src);

  return exampleDirs.reduce((entry, dir) => {
    entry['./' + basename(dir) + '/bundle'] = `${dir}/index.js`;
    return entry;
  }, {});
};

module.exports = {
  entry: generateExampleEntries(),

  mode: 'development',

  output: {
    path: resolve(__dirname, 'dist'),

    // [name] here will be used from the "entry" object.
    // As each key in "entry" object forms a file path,
    // Webpack will create a matching folder structure
    // on build.
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { targets: { chrome: '60' } }]],
        },
      },
    ],
  },

  resolve: {
    alias: {
      'react-sweet-state': resolve(__dirname, './src'),
    },
  },

  devServer: {
    contentBase: resolve(__dirname, 'examples'),
    publicPath: '/',
    // hot: true,
  },
};
