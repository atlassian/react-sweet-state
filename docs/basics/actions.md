## Store actions

Actions are functions that can mutate data in a Store.

```js
const actions = {
  reset: () => ({ setState }) => {
      setState({ count: 0 });
    };
  },
};
```

Actions are functions that return another function. While you will responsible to call the "outer" function with the arguments that you please, the "inner" function (called thunk) is automatically called by sweet-state itself right after the "outer" one, with two arguments. The first one is an object with `setState`, `getState`, `actions`, `dispatch` while the second argument is an object containing the custom props defined on the `Container` [component type](../advanced/container.md).

Assuming you want a function that increments the counter by a custom value, you can get current count value and add the provided number to it:

```js
const actions = {
  increment: (number) => ({ setState, getState }) => {
      const currentCount = getState().count;
      setState({ count: currentCount + number });
    };
  },
};
```

Then all you have to do is call that function, exposed via a `Subscriber` from your view:

```js
import { CounterSubscriber } from './components/counter';

const App = () => (
  <CounterSubscriber>
    {(state, actions) => (
      <button onClick={() => actions.increment(2)}>Add two</button>
    )}
  </CounterSubscriber>
);
```

For more details about actions see the full [actions API](../api/actions.md) or how to define [advanced action patters](../advanced/actions.md), like async actions.
