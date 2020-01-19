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

### Generic (and private) actions

Sometimes you might want to have generic actions that are called by other actions, but without exposing them publicly as part the API. That can be easily done using `dispatch`:

```js
const setLoading = () => ({ setState }) => {
  setState({ loading: true });
};

const setData = data => ({ setState }) => {
  setState({ loading: false, data });
};

const actions = {
  load: () => async ({ getState, dispatch }, { api }) => {
    if (getState().loading === true) return;

    dispatch(setLoading());
    const todos = await api.get('/todos');
    dispatch(setData(todos));
  },
};
```

### Triggering actions on other Stores

Sweet-state does not provide any built-in method to trigger actions on other Stores, however that’s OK as it forces a consistent Flux architecture, where every change applies top down.

Moreover, hooks allow a natural way to deal with actions composition, enabling integration not only between sweet-state actions but also with any other state management library. See [the composition section for some examples](../recipes/composition.md).

---

For more details about actions you can also check the [actions API](../api/actions.md).
