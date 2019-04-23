# react-sweet-state

Taking the good parts of Redux and React Context to build a flexible, scalable and easy to use state management solution.

## Philosophy

sweet-state is heavily inspired by Redux, the main difference is the lack of reducers. Instead of React Provider and Consumer, we have `Container` and `Subscriber`, connected to the same instance of a Store (defined as actions and initial state) and make it's state (or part of it) and the actions bound to the instance available via render-prop API.

Each `Subscriber` is responsible to get the instantiated Store (creating a new one with `initialState` if necessary). That makes sharing state across you project extremely easy.

Similar to Redux thunk, actions receive a set of arguments to get and mutate the state. The default `setState` implementation is similar to React `setState`, called with an object that will be shallow merged with the current state. But you are free to replace that with something different, even like `immer` for instance.

## Basic usage

```sh
npm i react-sweet-state
# or
yarn add react-sweet-state
```

#### Creating a Subscriber

```js
import { createStore, createSubscriber } from 'react-sweet-state';

const Store = createStore({
  // value of the store on initialisation
  initialState = {
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
})

const CounterSubscriber = createSubscriber(Store);
```

```js
// app.js
import { CounterSubscriber } from './components/counter';

const App = () => (
  <div>
    <h1>My counter</h1>
    <CounterSubscriber>
      {/* Store state is the first argument and actions are the second one */}
      {({ count }, { increment }) => (
        <div>
          {count}
          <button onClick={increment}>+</button>
        </div>
      )}
    </CounterSubscriber>
  </div>
);
```

## Documentation

[check the docs folder](docs/README.md).

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
