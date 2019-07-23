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
  increment: () => ({ setState }) => {
    // action code...
  },
};

const Store = createStore({ initialState, actions });
```

Optionally, you can add a `name` property to the `createStore` configuration object. It will be used as the displayName in Redux Devtools.

```js
const Store = createStore({ initialState, actions, name: 'counter' });
```

The first time a `Subscriber` or a `Container` linked to this store is rendered, a Store instance will be initialised and its state shared across all components created from the same Store. If you need multiple instances of the same Store, use the `Container` component ([see Container docs for more](../advanced/container.md)).
