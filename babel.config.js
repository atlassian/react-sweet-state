'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: [
          'last 2 chrome versions',
          'last 2 firefox versions',
          'last 2 safari versions',
          'last 2 and_chr versions',
          'last 2 ios_saf versions'
        ],
        modules: false,
        loose: true,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
    '@babel/preset-flow',
  ],
  env: {
    test: {
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-runtime'],
    },
  },
};
