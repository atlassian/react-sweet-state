## Store API

### createStore

```js
createStore(config);
```

##### Arguments

1. [`config`] _(Object)_: containing the following keys:

   - `initialState` _(Object)_: the store's initial state value.

   - `actions` _(Object)_: an object with all the actions that mutate the store instance.

   - `name` _(string)_: optional, useful for debugging and to generate more meaningful store keys.

##### Returns

_(Object)_: used to create Containers, Subscribers and hooks related to the same store type

##### Example

Let's create a Container that automatically populates the todos' Store instance with some todos coming from SSR, for instance.

```js
import { createContainer } from 'react-sweet-state';
import Store from './store';

const Store = createStore({
  name: 'todos',
  initialState: { todos: [] },
  actions: {
    load: () => async ({ setState }) => {
      const todos = await fetch('/todos');
      setState({ todos });
    },
  },
});
```
