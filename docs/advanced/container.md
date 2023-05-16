## Containers

> _Note: we recently improved Containers API to be more flexibile and safe. These docs now use the new Store's `containedBy` and `handlers` attributes. You still can find the old one documented [here](../api/container.md)._

While sweet-state promotes independent, globally accessible micro-Stores, such behaviour only allows one instance for each Store type and might become problematic as your app grows. As an example, you might want to have multiple instances of the same Store, or some store data to be cleaned up once a component unmounts. That's where `Container` components come into play. They allow you to create independent Store instances of the same type, making them either globally available (app-wide) or just locally (so only accessible to children hooks/subscribers).

```js
// components/counter.js
import { createStore, createContainer, createHook } from 'react-sweet-state';

export const CounterContainer = createContainer();

const Store = createStore({
  containedBy: CounterContainer,
  initialState: { count: 0 },
  actions: {
    increment:
      () =>
      ({ setState }) => {
        const currentCount = getState().count;
        setState({ count: currentCount + 1 });
      },
  },
});

const useCounter = createHook(Store);

export const CounterButton = () => {
  const [{ count }, { increment }] = useCounter();
  return <button onClick={increment}>{count}</button>;
};
```

The default behaviour of a `Container` is to create a locally scoped Store instance (accessible only to its children) but you can change this behaviour with either of these props:

- `isGlobal`: tells the `Container` to act like a transparent link to the "default" instance, stored in the global registry
- `scope`: is a string that makes the `Container` create (or get) a global instance "prefixed" with that scope id. This allows you to have as many global instances as you need

```js
const App = () => (
  <Fragment>
    <CounterContainer isGlobal>
      {/* this might be 1 */}
      <CounterButton />
    </CounterContainer>

    <CounterContainer scope={'counter-1'}>
      {/* this might be 2 */}
      <CounterButton />
    </CounterContainer>

    <CounterContainer>
      {/* this instance cannot be accessed elsewhere */}
      {/* this might be 20 */}
      <CounterButton />
    </CounterContainer>
  </Fragment>
);
```

The power of `Container` is that you can expand or reduce the scope at will, without requiring any change on the children. That means you can start local and later, if you need to access the same state elsewhere, you can either move the `Container` up in the tree or add the `scope` prop to "link" two separate trees or add `isGlobal` and make it singleton once again.

### Additional features

#### Scoped data sharing

If two `Container`s of the same type have the same `scope` they will share the same data, regardless where they are in the tree.

```js
const App = () => (
  <Fragment>
    <CounterContainer scope={'counter-1'}>
      {/* if this is 2 */}
      <CounterButton />
    </CounterContainer>

    <CounterContainer scope={'counter-1'}>
      {/* this will be 2 too */}
      <CounterButton />
    </CounterContainer>
  </Fragment>
);
```

#### Container props are available in actions

Props provided to containers are passed to Store `actions` and `handlers` as a second parameter [see actions API](../api/actions.md). This makes it extremely easy to pass dynamic configuration options to actions.

```js
const Store = createStore({
  containedBy: CounterContainer,
  initialState: { count: 0 },
  actions: {
    increment:
      () =>
      ({ setState }, { multiplier = 1 }) => {
        const currentCount = getState().count * multiplier;
        setState({ count: currentCount + 1 });
      },
  },
});

// ...

const App = () => (
  <CounterContainer scope={'counter-1'} multiplier={2}>
    {/* this will be an odd number */}
    <CounterButton />
  </CounterContainer>
);
```

> _NOTE: Remember though that those props will **only** be available to hooks/subscribers that are children of the `Container` that receives them, regardless of the Container being global/scoped._

#### Container enables additional Store handlers

By providing `containedBy` to a store you can enable additional `handlers` that trigger functions when specific events occur. Current supported handlers are: `onInit`, `onUpdate`, `onDestroy` and `onContainerUpdate`, and these methods' shape is the same as all other actions.

```js
const Store = createStore({
  containedBy: CounterContainer,
  initialState: { count: 0 },
  actions: {
    increment:
      () =>
      ({ setState }, { multiplier }) => {
        const currentCount = getState().count * multiplier;
        setState({ count: currentCount + 1 });
      },
  },
  handlers: {
    onContainerUpdate:
      () =>
      ({ setState }, { multiplier }) => {
        setState({ count: 0 }); // reset state on multiplier change
      },
  },
});

const App = ({ n }) => (
  <CounterContainer scope={'counter-1'} multiplier={n}>
    {/* this starts from 10 */}
    <CounterButton />
  </CounterContainer>
);
```

#### Scoped data cleanup

Store instances created by `Container`s without `isGlobal` are automatically cleared once the last Container accessing that Store is unmounted. At that point `handlers.onDestroy` will also be called.

---

For more details about Containers see the [Containers API](../api/container.md)
