## Container API

### createContainer

```js
createContainer(Store, [options]);
```

##### Arguments

1. `Store` _(Object)_: The store type returned by running `createStore`

2. [`options`] _(Object)_: containing one or more of the following keys:

   - `displayName` _(string)_: Used by React to better identify a component. Defaults to `Container(${storeName})`

   - `onInit` _(Function)_: an action that will be triggered on container initialisation. If you define multiple containers this action will be run each time one of the container components is initialised by React.

   - `onUpdate` _(Function)_: an action that will be triggered when props on a container change.

##### Returns

_(Component)_: this React component allows you to change the behaviour of child Subscriber components by providing different Store instances or custom props to actions. It accept the following props:

- `isGlobal` _(bool)_: by default, Container defines a local store instance. This prop will allow child Subscribers to get data from the global store's registry instance instead

- `scope` _(string)_: this option will allow creating multiple global instances of the same store. Those instances will be automatically cleaned once all the containers pointing to the scoped version are removed from the tree. Changing a Container `scope` will: create a new Store instance, make `onInit` action run again and all child Subscribers will get the data from it.

- `...props` _(any)_: any additional prop set on the Container component is made available in the actions of child Subscribers

##### Example

Let's create a Container that automatically populates the todos' Store instance with some todos coming from SSR, for instance.

```js
import { createContainer } from 'react-sweet-state';
import Store from './store';

const TodosContainer = createContainer(Store, {
  onInit: () => ({ setState }, { initialTodos }) => {
    setState({ todos: initialTodos });
  },
});

const UserTodos = ({ initialTodos }) => (
  <TodosContainer initialTodos={initialTodos}>
    <TodosList />
  </TodosContainer>
);
```
