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
          'last 2 ios_saf versions',
          'edge >= 18',
        ],
        modules: false,
        loose: true,
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties'],
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
  ],
  env: {
    test: {
      presets: ['@babel/preset-env'],
      plugins: ['@babel/plugin-transform-runtime'],
    },
  },
};
