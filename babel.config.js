'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { edge: '16' },
        modules: false,
        exclude: ['transform-typeof-symbol'],
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
