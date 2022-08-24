## Hooks API

### createHook

```js
createHook(Store, [options]);
```

##### Arguments

1. `Store` _(Object)_: The store type returned by running `createStore`

2. [`options`] _(Object)_: containing one or more of the following keys:

   - `selector` _(Function | null)_: a function that will be triggered every time the hook gets new state or props. If it's `null`, then the hook will not trigger a re-render on state change. The selector function is called with two arguments:
     1. `state`: the store instance state
     2. `props`: the custom props defined on the component itself

##### Returns

_(Function)_: this custom hook will automatically trigger a re-render on store state change (unless selector is defined). It will return an array with two indexes:

1. `state` _(Object)_: the state returned by the selector function. By default, the entire store instance state

2. `actions` _(Object)_: all the actions defined in the Store

##### Example

Let's create a hook that gets the todos by status:

```js
import { createHook } from 'react-sweet-state';
import Store from './store';

const useTodosByStatus = createHook(Store, {
  selector: (state, props) =>
    state.todos.filter((t) => t.status === props.status),
});

const Todos = ({ status = 'done' }) => {
  const [todos, actions] = useTodosByStatus({ status });
  return todos.map((todo) => <Todo todo={todo} onAddTodo={actions.add} />);
};
```

The library also provides two specific creators to make actions only and state only hooks, for more specific use cases.

### createStateHook

```js
createStateHook(Store, [options]);
```

##### Arguments

1. `Store` _(Object)_: The store type returned by running `createStore`

2. [`options`] _(Object)_: containing one or more of the following keys:

   - `selector` _(Function)_: same as `createHook` `selector` optional function that will be triggered every time the hook gets new state or props. The selector function is called with two arguments:
     1. `state`: the store instance state
     2. `props`: the custom props defined on the component itself

##### Returns

_(Function)_: this custom hook will automatically trigger a re-render on store state (or selector output) change. It will return:

- `state` _(Object)_: the state returned by the selector function. By default, the entire store instance state

##### Example

Let's create a hook that gets the todos by status:

```js
import { createStateHook } from 'react-sweet-state';
import Store from './store';

const useTodosByStatus = createStateHook(Store, {
  selector: (state, props) =>
    state.todos.filter((t) => t.status === props.status),
});

const Todos = ({ status = 'done' }) => {
  const todos = useTodosByStatus({ status });
  return todos.map((todo) => <Todo todo={todo} />);
};
```

### createActionsHook

```js
createActionsHook(Store);
```

##### Arguments

1. `Store` _(Object)_: The store type returned by running `createStore`

##### Returns

_(Function)_: this custom hook will **never** trigger a re-render, as it just returns:

- `actions` _(Object)_: all the actions defined in the Store

##### Example

```js
import { createActionsHook } from 'react-sweet-state';
import Store from './store';

const useTodosActions = createActionsHook(Store);

const TodoToolbar = ({ todo }) => {
  const { setDone } = useTodosActions();
  return <button onClick={() => setDone(todo.id)}>Done</button>;
};
```
