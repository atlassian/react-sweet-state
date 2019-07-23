## Actions API

### Inner function signature

Given a standard action, the arguments of the "inner" function called by **sweet-state** itself are the following:

```js
const actions = {
  doSomething: (...args) => (
    { setState, getState, actions, dispatch },
    containerProps
  ) => {
    // your code here
  },
};
```

The first argument is an object containing:

##### - setState

It is the method responsible for triggering actual updates to the store. The default is a syncronous version of React `setState`, supporting only an object as argument (shallow merged into current state). See React guidelines for do's and dont's around `setState` for more around the limitations of shallow merge.

```js
// inside your action
setState({ count: 0 });
```

Note: You can replace this default implementation with a custom one, for instance with [immer](https://github.com/mweststrate/immer), by overriding `defaults.mutator`.

##### - getState

This method returns a fresh state every time it is called:

```js
// inside your action
if (getState().loading) {
  /* ... */
}
```

Note: Pay attetion while storing parts of the state in a variable inside the actions: they might become stale especially during async operations.

##### - actions

This object contains all the actions you have defined for this store, ready to be called. So you can fire actions from other actions.

```js
const actionDefinitions = {
  increment: n => ({ setState, getState }) => {
    setState({ count: getState().count + n });
  },
  resetTo: n => ({ setState, actions }) => {
    setState({ count: 0 });
    actions.increment(n);
  },
};
```

##### - dispatch

Same as above, this method allows you to trigger other actions. It is an alternative to the `actions` object but this time calling the method desined in the Store actions object directly.

```js
const actionDefinitions = {
  increment: n => ({ setState, getState }) => {
    setState({ count: getState().count + n });
  },
  resetTo: n => ({ setState, dispatch }) => {
    setState({ count: 0 });
    dispatch(actionDefinitions.increment(n));
  },
};
```

#### containerProps

The second argument of the action "inner" function contains the custom props that you can set on the `Container` component wrapping the subscriber that is exposing the action. For instance, assuming you set a `multiplyBy` prop on the `CounterContainer`:

```js
const App = () => (
  <CounterContainer multiplyBy={2}>
    <CounterSubscriber>
      {(state, actions) => (
        <button onClick={actions.increment}>increment by 2</button>
      )}
    </CounterSubscriber>
  </CounterContainer>
);
```

When the `increment` action is called, it can access the value `multiplyBy` in the `containerProps` object:

```js
const actions = {
  increment: (n = 1) => ({ setState, getState }, { multiplyBy }) => {
    setState({ count: getState().count + n * multiplyBy });
  },
};
```

This is useful in case you want to make the same data to be available to all actions, or to update the Store state when one of those props is changed ([see Container docs for more](../advanced/container.md)).
