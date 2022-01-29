#### Store state hydration

Initialising a Store with data can be very useful. Particularly important when server-side rendering your application. To make this happen you can render a `Container` configured with an `onInit` action and passing it your initial state as a `prop` (we assume the initial state data is readily available in your render context).

##### Hydrate through a Container

As seen in use in the `Container` chapter:

```js
const CounterContainer = createContainer(Store, {
  onInit:
    () =>
    ({ setState }, { initialCount }) => {
      setState({ count: initialCount });
    },
});

const App = () => (
  <CounterContainer isGlobal initialCount={window.INITIAL_STATE}>
    {/* ... */}
  </CounterContainer>
);
```

The `Container` is configured with an `onInit` action that takes the initial state prop and stores it. This will make the initial state immediately available to all hooks/subscribers executing after, avoiding unnecessary re-renders.

_Note: remember to manage in the Container's `onInit` any checks for previous state existence or runtime environment._
