## Advanced actions patterns

### Async actions

Like [redux-thunk](https://github.com/reduxjs/redux-thunk), store actions can be async and you can call `setState` as many time as you need. Please note that changes to the state are applied immediately, so you should use `getState` to query for a fresh value.

```js
const actions = {
  load: () => async ({ setState, getState }, { api }) => {
    if (getState().loading === true) return;
    setState({
      loading: true,
    });

    const todos = await api.get('/todos');
    setState({
      loading: false,
      data: todos,
    });
  },
};
```

Remember that sweet-state automatically calls and returns the "inner" function, so in your view you can easily chain async actions together.
Assuming your Form Store has an async `save` action we can `.then()` right after:

```js
const App = () => (
  <FormSubscriber>
    {(state, actions) => (
      <form onSumbit={() => actions.save().then(/* do something after save*/)}>
        {/* other form code here */}
      </form>
    )}
  </FormSubscriber>
);
```

For more details about actions you can also check the [actions API](../api/actions.md).
