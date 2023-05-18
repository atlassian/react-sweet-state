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

   - `containedBy` _(Container)_: optional, specifies the Container component that should handle the store boundary.  
     If set, RSS will throw an async uncaught error whenever the store is used without a container, given it might still work but it will likely cause unexpected behaviours.

   - `handlers` _(object)_: optional, defines callbacks on specific events

     - `onInit` _(Function)_: action triggered on store initialisation
     - `onUpdate` _(Function)_: action triggered on store update
     - `onDestroy` _(Function)_: action triggered on store destroy
     - `onContainerUpdate` _(Function)_: action triggered when `containedBy` container props change

##### Returns

_(Object)_: used to create hooks, Subscribers and override Containers, related to the same store type

##### Example

Let's create a Store with an action that loads the todos' and triggers it on store initialisation

```js
import { createStore } from 'react-sweet-state';
import { TodosContainer } from './container';

const actions = {
  load:
    () =>
    async ({ setState }) => {
      const todos = await fetch('/todos');
      setState({ todos });
    },
};

const Store = createStore({
  name: 'todos',
  initialState: { todos: [] },
  actions,
  containedBy: TodosContainer,
  handlers: {
    onInit:
      () =>
      async ({ dispatch }) => {
        await dispatch(actions.load());
      },
  },
});
```
