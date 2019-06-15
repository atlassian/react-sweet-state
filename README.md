# react-sweet-state

[![npm](https://img.shields.io/npm/v/react-sweet-state.svg)](https://www.npmjs.com/package/react-sweet-state)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/react-sweet-state.svg)](https://bundlephobia.com/result?p=react-sweet-state)
[![License](https://img.shields.io/:license-MIT-blue.svg)](./LICENSE)
[![CircleCI](https://circleci.com/gh/atlassian/react-sweet-state.svg?style=shield&circle-token=d3c768530427b29f35c0fe378d12fc2696badc1d)](https://circleci.com/gh/atlassian/react-sweet-state)
[![codecov](https://codecov.io/gh/atlassian/react-sweet-state/branch/master/graph/badge.svg)](https://codecov.io/gh/atlassian/react-sweet-state)

Taking the good parts of Redux and React Context to build a flexible, scalable and easy to use state management solution.

## Philosophy

sweet-state is heavily inspired by Redux, the main difference is the lack of reducers. Instead of React Provider and Consumer, it provides `Container` and `Subscriber`, connected to the same instance of a Store (defined as actions and initial state), making its state (or part of it) and actions available via render-prop or hooks APIs.

Each `Subscriber`, or `Hook`, is responsible to get the instantiated Store (creating a new one with `initialState` if necessary), allowing sharing state across you project extremely easy.

Similar to Redux thunks, actions receive a set of arguments to get and mutate the state. The default `setState` implementation is similar to React `setState`, accepting an object that will be shallow merged with the current state. However you are free to replace the built in `setState` logic with custom, like `immer` for instance.

## Basic usage

```sh
npm i react-sweet-state
# or
yarn add react-sweet-state
```

#### Creating a Subscriber

```js
import { createStore, createSubscriber, createHook } from 'react-sweet-state';

const Store = createStore({
  // value of the store on initialisation
  initialState: {
    count: 0,
  },
  // actions that trigger store mutation
  actions: {
    increment: (by = 1) => ({ setState, getState }) => {
      // mutate state synchronously
      setState({
        count: getState().count + by,
      });
    },
  },
  // optional, mostly used for easy debugging
  name: 'counter',
});

const CounterSubscriber = createSubscriber(Store);
// or
const useCounter = createHook(Store);
```

```js
// app.js
import { CounterSubscriber } from './components/counter';

const App = () => (
  <div>
    <h1>My counter</h1>
    <CounterSubscriber>
      {/* Store state is the first argument and actions are the second one */}
      {(state, actions) => (
        <div>
          {state.count}
          <button onClick={actions.increment}>+</button>
        </div>
      )}
    </CounterSubscriber>
  </div>
);
```

## Documentation

[Check the docs website](https://atlassian.github.io/react-sweet-state/)  
[or the docs folder](docs/README.md).

## Examples

See sweet-state in action: run `npm run start` and then go and check each folder:

- Basic example with Flow typing `http://localhost:8080/basic-flow/`
- Advanced async example with Flow typing `http://localhost:8080/advanced-flow/`
- Advanced scoped example with Flow typing `http://localhost:8080/advanced-scoped-flow/`

## Contributing

To test your changes you can run the examples (with `npm run start`).
Also, make sure you run `npm run preversion` before creating you PR so you will double check that linting, types and tests are fine.

## Thanks

This library merges ideas from redux, react-redux, redux-thunk, react-copy-write, unstated, bey, react-apollo just to name a few.
Moreover it has been the result of months of discussions with [ferborva](https://github.com/ferborva), [pksjce](https://github.com/pksjce), [TimeRaider](https://github.com/TimeRaider), [dpisani](https://github.com/dpisani), [JedWatson](https://github.com/JedWatson), and other devs at [Atlassian](https://github.com/atlassian).
