## Container API

### createContainer

```js
createContainer(Store, [options]);
```

##### Arguments

1. `Store` _(Object)_: The store type returned from a call to `createStore`

2. [`options`] _(Object)_: containing one or more of the following keys:

   - `displayName` _(string)_: Used by React to better identify a component. Defaults to `Container(${storeName})`

   - `onInit` _(Function)_: an action that will be triggered on container initialisation. If you define multiple containers this action will be run each time one of the container components is initialised by React.

   - `onUpdate` _(Function)_: an action that will be triggered when props on a container change.

   - `onCleanup` _(Function)_: an action that will be triggered after the container has been unmounted. Useful in case you want to clean up side effects like event listeners or timers, or restore the store state to its initial state. As with `onInit`, if you define multiple containers this action will trigger after unmount of each one.

##### Returns

_(Component)_: this React component allows you to change the behaviour of child components by providing different Store instances or custom props to actions. It accept the following props:

- `isGlobal` _(bool)_: by default, Container defines a local store instance. This prop will allow child components to get data from the global store's registry instance instead

- `scope` _(string)_: this option will allow creating multiple global instances of the same store. Those instances will be automatically cleaned once all the containers pointing to the scoped version are removed from the tree. Changing a Container `scope` will: create a new Store instance, make `onInit` action run again and all child components will get the data from it.

- `...props` _(any)_: any additional prop set on the Container component is made available in the actions of child components

##### Example

Let's create a Container that automatically populates the todos' Store instance with some todos coming from SSR, for instance.

```js
import { createContainer } from 'react-sweet-state';
import Store from './store';

const TodosContainer = createContainer(Store, {
  onInit:
    () =>
    ({ setState }, { initialTodos }) => {
      setState({ todos: initialTodos });
    },
});

const UserTodos = ({ initialTodos }) => (
  <TodosContainer initialTodos={initialTodos}>
    <TodosList />
  </TodosContainer>
);
```

### createDynamicContainer

```js
createDynamicContainer(config);
```

##### Arguments

1. `config` _(Object)_: containing one or more of the following keys:

   - `displayName` _(string)_: used by React to better identify a component. Defaults to `DynamicContainer`

   - `matcher` _(Function)_: a function returning `true` for stores that need to be contained. Required.

   - `onStoreInit` _(Function)_: an action that will be triggered on each store initialisation. If you define multiple containers sharing the same scope, this action will still only be run **once** by one of the container components, so ensure they receive the same props.

   - `onStoreUpdate` _(Function)_: an action that will be triggered when a store state changes.

   - `onStoreCleanup` _(Function)_: an action that will be triggered after a store is no longer listened to (usually after container unmounts). Useful in case you want to clean up side effects like event listeners or timers. As with `onStoreInit`, if you define multiple containers this action will trigger by the **last one** unmounting.

   - `onPropsUpdate` _(Function)_: an action that will be triggered when props on a container change.

##### Returns

_(Component)_: this React component allows you to change the behaviour of child components by providing different Store instances or custom props to actions. It accept the following props:

- `isGlobal` _(bool)_: by default, Container defines a local store instance. This prop will allow child components to get data from the global store's registry instance instead

- `scope` _(string)_: this option will allow creating multiple global instances of the same store. Those instances will be automatically cleaned once all the containers pointing to the scoped version are removed from the tree. Changing a Container `scope` will: create a new Store instance, make `onInit` action run again and all child components will get the data from it.

- `...props` _(any)_: any additional prop set on the Container component is made available in the actions of child components

##### Example

Let's create a Container that conatins and initializes all theme-related stores, for instance.

```js
import { createDynamicContainer } from 'react-sweet-state';

// Assume we have a ColorsStore and a FontSizesStore with `tags: ['theme']`

const ThemeContainer = createDynamicContainer({
  matcher: (Store) => Store.tags.includes('theme'),
  onStoreInit:
    () =>
    ({ setState, getState }, { initialTheme }) => {
      const state = getState();
      if ('colors' in state) {
        // refining to colors store
        setState({ colors: initialTheme.colors });
      }
      if ('fontSizes' in state) {
        // refining to sizes store
        setState({ sizes: initialTheme.sizes });
      }
    },
});

const UserTheme = ({ colors, sizes }) => (
  <ThemeContainer initialTheme={{ colors, sizes }}>
    <TodosList />
  </ThemeContainer>
);
```
