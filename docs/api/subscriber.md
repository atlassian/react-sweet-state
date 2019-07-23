## Subscribers API

### createSubscriber

```js
createSubscriber(Store, [options]);
```

##### Arguments

1. `Store` _(Object)_: The store type returned by running `createStore`

2. [`options`] _(Object)_: containing one or more of the following keys:

   - `displayName` _(string)_: Used by React to better identify a component. Defaults to `Container(${storeName})`

   - `selector` _(Function | null)_: an function that will be triggered every time the Subscriber gets new state or props. If it's `null`, then the Subscriber will not re-render on state change. The selector function is called with two arguments:
     1. `state`: the store instance state
     2. `props`: the custom props defined on the component itself

##### Returns

_(Component)_: this React component will automatically re-render on store state change (unless selector is defined). It only accepts a function as child (aka render prop) that will be executes with two arguments:

1. `state` _(Object)_: the state returned by the selector function. By default, the entire store instance state

2. `actions` _(Object)_: all the actions defined in the Store

##### Example

Let's create a Selector subscriber that gets the todos by status:

```js
import { createSubscriber } from 'react-sweet-state';
import Store from './store';

const TodosByStatusSubscriber = createSubscriber(Store, {
  selector: (state, props) => ({
    todos: state.todos.filter(t => t.status === props.status),
  }),
});

const Todos = ({ status = 'done' }) => (
  <TodosByStatusSubscriber status={status}>
    {({ todos }, actions) =>
      todos.map(todo => <Todo todo={todo} onAddTodo={actions.add} />)
    }
  </TodosByStatusSubscriber>
);
```
