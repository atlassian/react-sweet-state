#### Store state hydration

Initialising a Store with data can be very useful, particularly when server-side rendering your application. To make this happen you can use a `Container` passing it your initial state as a `prop` (we assume the initial state data is readily available in your render context) and then use Store's `handlers.onInit` to populate the state accordingly.

##### Hydrate through a Container

As seen in use in the `Container` chapter:

```js
const CounterContainer = createContainer();

const Store = createStore({
  containedBy: CounterContainer,
  initialState: { count: 0 },
  actions: {},
  handlers: {
    onInit:
      () =>
      ({ setState }, { initialCount }) => {
        setState({ count: initialCount });
      },
  },
});

const App = () => (
  <CounterContainer initialCount={window.INITIAL_STATE}>
    {/* ... */}
  </CounterContainer>
);
```

The benefit of this approach compared to triggering an `useEffect` action is that the initial state will be immediately available to all hooks/subscribers executing after, avoiding unnecessary re-renders.
