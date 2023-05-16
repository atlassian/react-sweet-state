## Creating a Store

A **sweet-state** Store is an object created with an initial state and the actions that are going to mutate it.

To create a Store:

```js
import { createStore } from 'react-sweet-state';

// This is the value of the store on initialisation
const initialState = {
  count: 0,
};

// All the actions that mutate the store
const actions = {
  increment:
    () =>
    ({ setState }) => {
      // action code...
    },
};

const Store = createStore({ initialState, actions });
```

Optionally, you can add to the `createStore` configuration object a unique `name` property, a bound to a Container component via `containedBy` property, and a series of `handlers` to trigger actions on specific events.

```js
const Store = createStore({
  initialState,
  actions,
  name: 'counter',
  containedBy: StoreContainer,
  handlers: {
    onInit:
      () =>
      ({ setState }, containerProps) => {},
    onUpdate:
      () =>
      ({ setState }, containerProps) => {},
    onDestroy:
      () =>
      ({ setState }, containerProps) => {},
    onContainerUpdate:
      () =>
      ({ setState }, containerProps) => {},
  },
});
```

The first time a hook or a `Container` linked to this store is rendered, a Store instance will be initialised and its state shared across all components created from the same Store. If you need multiple instances of the same Store, use the `Container` component ([see Container docs for more](../advanced/container.md)).
