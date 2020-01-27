#### Store state hydration

Initialising a Store with data can be very useful. Particularly important when server-side rendering your application. To make this happen you can choose one of two ways:

- render a `Container` configured with an `onInit` action and passing it your initial state as a `prop`
- render a `Subscriber` or use a hook and trigger an action that handles your initial state

In both scenarios we assume the initial state data is readily available in your render context.

##### Hydrate through a Container

We have already seen this in use in the `Container` chapter:

```js
const CounterContainer = createContainer(Store, {
  onInit: () => ({ setState }, { initialCount }) => {
    setState({ count: initialCount });
  },
});

const App = () => (
  <CounterContainer isGlobal initialCount={window.INITIAL_STATE}>
    {/* ... */}
  </CounterContainer>
);
```

As you see, the `Container` is configured with an `onInit` action that takes the initial state prop and stores it. This is the preferred way of initialising the Store as it will make the initial state immediately available to all subscribers executing after, avoiding unnecessary re-renders.

##### Hydrate through an action

```js
import { createHook } from 'react-sweet-state';
import Store from './store';

const actions = {
  initState: initialState => ({ setState }) => setState(initialState),
};

const useCounterActions = createHook(Store, {
  selector: null,
});

const App = () => {
  const [, { initState }] = useCounterActions();
  useMemo(() => initState(window.INITIAL_STATE), []);

  return (
    {/* ... */}
  );
```

As we pointed out in the previous section, this way of initialising the Store state adds additional complexity to your render function.

_Note: in either case you'll have to manage in your action or the Container's `onInit` any checks for previous state existence or runtime environment._
