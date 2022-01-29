## Subscribers

> _Note: this pattern has been developed before hooks were a thing. We still support it for compatibility reason, but we recommend you move to hooks, which offer more flexibility._

### Creating a Subscriber

A `<Subscriber />` allows you to access Store state and actions in your views, via the render props pattern.
After defining a Store, we can create `Subscriber` components for that Store with `createSubscriber`:

```js
// components/counter.js
import { createStore, createSubscriber } from 'react-sweet-state';

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

export const CounterSubscriber = createSubscriber(Store);
```

### Using a Subscriber

Now you can use `CounterSubscriber` in your views, and it will expose the Store instance `state` and `actions` as arguments of the render prop function:

```js
// app.js
import { CounterSubscriber } from './components/counter';

const App = () => (
  <CounterSubscriber>
    {/* Store state is the first argument and actions are the second one */}
    {({ count }, { increment }) => (
      <div>
        {count}
        <button onClick={increment}>Add one</button>
      </div>
    )}
  </CounterSubscriber>
);
```

--

For more details about Subscribers see the [Subscribers API](../api/subscriber.md) or how to create [selector subscribers](../advanced/selector.md).
