## Creating Subscribers/hooks with selectors

**sweet-state** allows you to create Subscribers and hooks that return a specific (or transformed) part of the state, and they re-render only if the output is not shallow equal. Creating such components is extremely easy as you only need to specify a `selector` function on creation:

```js
import { createStore, createSubscriber, createHook } from 'react-sweet-state';

const Store = createStore({
  initialState: {
    currentUserId: null,
    users: [],
  },
  actions: {
    // fetch users, set currentUserId, ecc...
  },
});

const getCurrentUser = state =>
  state.users.find(user => user.id === state.currentUserId);

export const CurrentUserSubscriber = createSubscriber(Store, {
  selector: getCurrentUser,
});

export const useCurrentUser = createHook(Store, {
  selector: getCurrentUser,
});
```

As long as the user returned by `find` is shallow equal to the previews one, `CurrentUserSubscriber` will not re-render it's children, but the selector will still be executed every time the state is mutated. If you need the selector to selectively recompute, read the [section below about reselect](#adding-reselect-to-memoize-selectors).

#### Selectors with props

The `selector` also receives a second argument (`props`) that are the custom props passed to the Subscriber:

```js
import { createStore, createSubscriber, createHook } from 'react-sweet-state';

const Store = createStore({
  initialState: { todos: [] },
  actions: {
    // fetch todos, ecc...
  },
});

const getTodosByStatus = (state, props) => ({ todos: state.todos.filter(t => t.status === props.status) });

export const TodosByStatusSubscriber = createSubscriber(Store, {
  selector: getTodosByStatus,
});

export const useTodosByStatus = createHook(Store, {
  selector: getTodosByStatus,
});

export const TodoList = ({ status }) => (
  <TodosByStatusSubscriber status={status}>
    {({ todos }) => /* render... */}
  </TodosByStatusSubscriber>
);
// or
export const TodoList = ({ status }) => {
  const [state, actions] = useTodosByStatus({ status });
  return todos.map(/* render... */);
}
```

#### Stateless selectors

A useful value for the `selector` option is `null`. This will create a `Subscriber` that will:

- not re-render on any store state change.
- only expose access to the actions

_Note: it will re-render if its parent re-renders, as sweet-state is **not** using `PureComponent` nor does it use `shouldComponentUpdate`_

So `null` is useful when children just have to trigger actions:

```js
import { createStore, createSubscriber, createHook } from 'react-sweet-state';

const Store = createStore({
  initialState: { todos: [] },
  actions: {
    refetch: () => async ({ setState }) => {
      /* etc... */
    },
  },
});

export const TodosActions = createSubscriber(Store, {
  selector: null,
});

export const useTodosActions = createHook(Store, {
  selector: null,
});

export const RefetchButton = () => (
  <TodosActions>
    {(__, { actions }) => <button onClick={actions.refetch}>Refetch</button>}
  </TodosActions>
);
// or
export const RefetchButton = () => {
  const [, actions] = useTodosActions();
  return <button onClick={actions.refetch}>Refetch</button>;
};
```

#### Adding reselect to memoize selectors

In case `selector` is expensive or returns complex mutated data every single time it is executed, it can be enhanced with [reselect](https://github.com/reduxjs/reselect) `createSelector`. This way, you ensure it gets recomputed only when relevant parts of state/props change:

```js
import { createStore, createSubscriber, createHook } from 'react-sweet-state';
import { createSelector } from 'reselect';

const Store = createStore({
  initialState: { todos: [], loading: false, error: null, statusFilter: '' },
  actions: {
    // fetch todos, ecc...
  },
});

const getFilteredTodos = createSelector(
  state => state.data.todos,
  state => state.statusFilter,
  (todos, status) => ({ todos: todos.filter(t => t.status === status) })
);

export const TodosFilteredSubscriber = createSubscriber(Store, {
  selector: getFilteredTodos,
});

export const TodoList = ({ status }) => (
  <TodosFilteredSubscriber status={status}>
    {({ todos }) => /* render... */}
  </TodosFilteredSubscriber>
);
```

In the example above, if other attributes of the state change (eg: `loading`), `TodosFilteredSubscriber` will not re-render.
