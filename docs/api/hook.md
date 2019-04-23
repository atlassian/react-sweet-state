## Hook API

### createHook

```js
createHook(Store, [options]);
```

##### Arguments

1. `Store` _(Object)_: The store type returned by running `createStore`

2. [`options`] _(Object)_: containing one or more of the following keys:

   - `selector` _(Function | null)_: an function that will be triggered every time the hook gets new state or props. If it's `null`, then the hook will not trigger a re-render on state change. The selector function is called with two arguments:
     1. `state`: the store instance state
     2. `props`: the custom props defined on the component itself

##### Returns

_(Function)_: this custom hook will automatically trigger a re-render on store state change (unless selector is defined). It will return an array with two indexes:

1. `state` _(Object)_: the state returned by the selector function. By default, the entire store instance state

2. `actions` _(Object)_: all the actions defined in the Store

##### Example

Let's create a hook subscriber that gets the todos by status:

```js
import { createHook } from 'react-sweet-state';
import Store from './store';

const useTodosByStatus = createHook(Store, {
  selector: (state, props) =>
    state.todos.filter(t => t.status === props.status),
});

const Todos = ({ status = 'done' }) => {
  const [todos, actions] = useTodosByStatus({ status });
  return todos.map(todo => <Todo todo={todo} onAddTodo={actions.add} />);
};
```
