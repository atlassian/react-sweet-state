## Creating a Store

sweet-state Store is an object that describes your initial state and the actions that are going to mutate it. It defines the "type" of data that Subscribers and Containers will deal with, so updates reach only relevant components.

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

Optionally you can add a `name` property to the `createStore` object above, for easier debugging in Redux Devtools.

```js
const Store = createStore({ initialState, actions, name: 'counter' });
```

Once a `Subscriber` is rendered, a Store "instance" is created and the state is now shared across all components created from the same Store. But if you need more instances of the same Store, `Container` component allows you to instantiate them ([see Container docs for more](../advanced/container.md)).
