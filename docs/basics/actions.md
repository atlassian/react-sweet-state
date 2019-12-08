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

Actions are functions that return another function. While you will be responsible for calling the "outer" function with the arguments that you please, the "inner" function (called thunk) is automatically called by **sweet-state** itself right after the "outer" one is invoked. The thunk receives two arguments:

- 1st. an object with `setState`, `getState`, `dispatch`
- 2nd. an object containing the custom props defined on the `Container` [component type](../advanced/container.md).

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

Then all you have to do is call that function, exposed via a `Subscriber`, or a hook, from your view:

```js
import { useCounter } from './components/counter';

const App = () => {
  const [, { increment }] = useCounter();

  return <button onClick={() => increment(2)}>Add two</button>;
};
```

---

For more details about actions, see the full [actions API](../api/actions.md) or how to define [advanced action patterns](../advanced/actions.md), like async actions.
