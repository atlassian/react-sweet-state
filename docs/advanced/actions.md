## Advanced action patterns

### Async actions

Like [redux-thunk](https://github.com/reduxjs/redux-thunk), store actions can be async and you can call `setState` as many time as you need. Please note that changes to the state are applied immediately, so you should use `getState` to query for a fresh value if you need it between `setState` calls.

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

---

For more details about actions you can also check the [actions API](../api/actions.md).
