<h1>
  <img align="middle" src="https://user-images.githubusercontent.com/84136/59560300-2fca8e80-9053-11e9-8f90-76d9ef281ca6.png" alt="react-sweet-state logo" height="100" />
  <span>react-sweet-state</span>
</h1>

Taking the good parts of Redux and React Context to build a flexible, scalable and easy to use state management solution.

```sh
npm i react-sweet-state
# or
yarn add react-sweet-state
```

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
      // mutate state syncronously
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

const App = () => (
  <div>
    <h1>My counter</h1>
    <CounterSubscriber>
      {/* Store state is the first argument and actions are the second one */}
      {(state, actions) => (
        <div>
          {state.count}
          <button onClick={() => actions.increment()}>Add +1</button>
          <button onClick={() => actions.increment(2)}>Add +2</button>
        </div>
      )}
    </CounterSubscriber>
  </div>
);
```
