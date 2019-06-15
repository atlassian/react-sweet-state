## Hooks

### Creating a hook

Render props (via Subscribers) are not the only way to access state and actions: sweet-state also provides a method to create hooks to access a Store state in your views.
As with Subscribers, after definining a Store, a custom hook can be created with `createHook`:

```js
// components/counter.js
import { createStore, createHook } from 'react-sweet-state';

const Store = createStore({
  initialState: { count: 0 },
  actions: {
    increment: () => ({ setState }) => {
      const currentCount = getState().count;
      setState({ count: currentCount + 1 });
    },
  },
});

export const useCounter = createHook(Store);
```

### Using a hook

Now you can use `useCounter` in your views, and it will expose the Store instance `state` and the `actions` as return value of the invocation:

```js
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

For more details about hooks see [hook API](../api/hook.md), or how to create [selector hooks](../advanced/selector.md).
