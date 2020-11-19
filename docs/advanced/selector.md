## Creating subscribers/hooks with selectors

**sweet-state** allows you to create hooks/subscribers that return a specific (or transformed) part of the state, and they re-render only if some condition change. Creating them is extremely easy as you only need to specify a `selector` function on creation:

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

export const useCurrentUser = createHook(Store, {
  selector: getCurrentUser,
});
// or
export const CurrentUserSubscriber = createSubscriber(Store, {
  selector: getCurrentUser,
});
```

The memoisation takes places on **both the inputs and the outputs**. If the arguments (state and props/args) are the same then the previous value will be returned without running the selector function. If at least one of the two is different, the selector function will be executed but the output still checked for shallow equalilty, and if so the previous result will be returned anyway.
Also, if your hook/subscriber does not receive any argument/props, Sweet-state will optimise the selector execution even further, by sharing its instance across all hooks/selectors thus computing it only once.

If you have complex transformations, you might want to use `createSelector` [API](#improve-memoisation-with-createSelector)
so you can reduce the amount of times the output selector runs on state change.

#### Selectors with props/argument

`selector` could also receive a second argument: that is either the first passed to the hook call or the props set on the subscriber. This allows hooks to return different results based on some context values (at the cost of a small deoptimisation as selectors will no longer be shared).

```js
import { createStore, createSubscriber, createHook } from 'react-sweet-state';

const Store = createStore({
  initialState: { todos: [] },
  actions: {
    // fetch todos, ecc...
  },
});

const getTodosByStatus = (state, arg) => ({
  todos: state.todos.filter(t => t.status === arg),
});

export const useTodosByStatus = createHook(Store, {
  selector: getTodosByStatus,
});

export const TodoList = ({ status }) => {
  const [todos, actions] = useTodosByStatus(status);
  return todos.map(/* render... */);
};
```

Note that if you need to pass more data to the hook as argument, you can use an object or array structure. It will checked for shallow equality so you don't need to worry about invalidating the selector inputs.

#### Stateless hooks/subscribers

A useful value for the `selector` option is `null`. This will create a hook/subscriber that will:

- not re-render on any store state change.
- only expose access to the actions

_Note: the subscriber component will still re-render if its parent re-renders, as sweet-state is **not** using `PureComponent` nor `shouldComponentUpdate`_

So `null` is useful when consumers just trigger actions:

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

export const useTodosActions = createHook(Store, {
  selector: null,
});

export const RefetchButton = () => {
  const [, actions] = useTodosActions();
  return <button onClick={actions.refetch}>Refetch</button>;
};
```

#### Improve memoisation with createSelector

In case a `selector` is expensive or returns complex mutated data every single time it is executed, it can be enhanced thanks to `createSelector`. This API allows the last function expressed in the argument list to be memoised independently so if its arguments are unchanged it will return the same value. This way, it gets recomputed only when relevant parts of state/props change:

```js
import {
  createStore,
  createHook,
  createHook,
  createSelector,
} from 'react-sweet-state';

const Store = createStore({
  initialState: { todos: [], loading: false },
  actions: {
    // fetch todos, set status filter, ecc...
  },
});

const getFilteredTodos = createSelector(
  state => state.todos,
  (__, props) => props.status,
  // this last function is memoised
  (todos, status) => todos.filter(t => t.status === status)
);

export const useTodosFiltered = createHook(Store, {
  selector: getFilteredTodos,
});

export const TodoList = ({ status }) => {
  const [todos, actions] = useTodosByStatus(status);
  return todos.map(/* render... */);
};
```

In the example above, if some other state key changes (eg: `loading`), the output selector that filters the todos will not run, as its arguments have not changed yet. If a new todo gets added but the status will not match the provided one, the output selector will run, but your component will not re-render as the two arrays will be shallow equal anyway.

You might be already familiar with such API if you used [reselect](https://github.com/reduxjs/reselect). Sweet-state provides a sligly optimised version of it (but you can also use `reselect`@^4 if you like).

Note: nested createSelectors (as using a createSelector selector as argument of another createSelector) are discouraged as they might cause unexpected invalidations (sometimes even making the memoisation completely useless). We recommend just use plain functions.
