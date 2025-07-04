module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:flowtype/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    // fix for eslint-plugin-flowtype/384 not supporting wildcard
    _: 'readonly',
  },
  plugins: ['react', 'react-hooks', 'import'],
  rules: {
    'no-shadow': ['error'],
    indent: ['off'],
    'linebreak-style': ['off'],
    quotes: ['off'],
    semi: ['off'],
    'react/no-direct-mutation-state': ['off'],
    'react/display-name': ['off'],
    'react/prop-types': ['off'],
    'react-hooks/rules-of-hooks': ['error'],
    'react-hooks/exhaustive-deps': ['warn'],
  },

  overrides: [
    {
      // Flow specific rules
      files: ['src/index.js.flow', '*/*flow.js', 'examples/*-flow/*/*.js'],
      // extends: ['plugin:flowtype/recommended'],
      plugins: ['flowtype'],
      rules: {
        'flowtype/generic-spacing': ['off'],
      },
    },
    {
      // TypeScript specific rules
      files: ['*.{ts,tsx}'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
      },
    },
    {
      // Jest env
      files: ['*.test.{js,ts,tsx}'],
      env: {
        jest: true,
      },
    },
  ],
};
