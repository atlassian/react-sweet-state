## Hooks

### Creating a hook

The best way to access state and actions in **sweet-state** is by creating hooks to consume in your views. After defining a Store, custom hooks can be created with `createHook` creator:

```js
// components/counter.js
import { createStore, createHook } from 'react-sweet-state';

const Store = createStore({
  initialState: { count: 0 },
  actions: {
    increment:
      () =>
      ({ setState, getState }) => {
        const currentCount = getState().count;
        setState({ count: currentCount + 1 });
      },
  },
});

export const useCounter = createHook(Store);
```

### Using a hook

Now you can use `useCounter` in your views. It will expose the Store instance `state` and the `actions` as return value of the invocation:

```jsx
// app.js
import { useCounter } from './components/counter';

const App = () => {
  const [state, actions] = useCounter();

  return (
    <div>
      {state.count}
      <button onClick={actions.increment}>Add one</button>
    </div>
  );
};
```

---

There are also two other flavours of hook creators: `createStateHook` and `createActionsHook`.
For more details about hooks see [hook API](../api/hook.md), or how to create [selector hooks](../advanced/selector.md).
