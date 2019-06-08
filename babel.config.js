'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: { ie: '11' },
        modules: false,
        exclude: ['transform-typeof-symbol'],
      },
    ],
    '@babel/preset-react',
    '@babel/preset-flow',
    '@babel/preset-typescript',
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
  // overrides: [
  //   {
  //     test: ['./src/**/*.tsx'],
  //     presets: [
  //       [
  //         '@babel/preset-env',
  //         {
  //           targets: { ie: '11' },
  //           modules: false,
  //           exclude: ['transform-typeof-symbol'],
  //         },
  //       ],
  //       '@babel/preset-react',
  //       '@babel/preset-typescript',
  //     ],
  //   },
  // ],
};
