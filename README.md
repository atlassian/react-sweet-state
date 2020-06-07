<p align="center">
  <img src="https://user-images.githubusercontent.com/84136/59560300-2fca8e80-9053-11e9-8f90-76d9ef281ca6.png" alt="react-sweet-state logo" height="150" />
</p>
<h1 align="center">react-sweet-state</h1>

[![npm](https://img.shields.io/npm/v/react-sweet-state.svg)](https://www.npmjs.com/package/react-sweet-state)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/react-sweet-state.svg)](https://bundlephobia.com/result?p=react-sweet-state)
[![License](https://img.shields.io/:license-MIT-blue.svg)](./LICENSE)
[![codecov](https://codecov.io/gh/atlassian/react-sweet-state/branch/master/graph/badge.svg)](https://codecov.io/gh/atlassian/react-sweet-state)

The good parts of Redux and React Context in a flexible, scalable and easy to use state management solution

## Philosophy

sweet-state is heavily inspired by Redux mixed with Context API concepts. It has render-prop components or hooks, connected to Store instances (defined as actions and initial state), receiving the Store state (or part of it) and the actions as a result.

Each `Subscriber`, or `Hook`, is responsible to get the instantiated Store (creating a new one with `initialState` if necessary), allowing sharing state across your project extremely easy.

Similar to Redux thunks, actions receive a set of arguments to get and mutate the state. The default `setState` implementation is similar to React `setState`, accepting an object that will be shallow merged with the current state. However, you are free to replace the built-in `setState` logic with a custom mutator implementation, like `immer` for instance.

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
    increment: () => ({ setState, getState }) => {
      // mutate state synchronously
      setState({
        count: getState().count + 1,
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
import { useCounter } from './components/counter';

const CounterApp = () => {
  const [state, actions] = useCounter();
  return (
    <div>
      <h1>My counter</h1>
      {state.count}
      <button onClick={actions.increment}>+</button>
    </div>
  );
};
```

## Documentation

Check the [docs website](https://atlassian.github.io/react-sweet-state/) or the [docs folder](docs/README.md).

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

<br/>

[![With ❤️ from Atlassian](https://raw.githubusercontent.com/atlassian-internal/oss-assets/master/banner-cheers.png)](https://www.atlassian.com)
