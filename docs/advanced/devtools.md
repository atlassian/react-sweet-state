#### Devtools

If you have [Redux Devtools extension](https://github.com/zalmoxisus/redux-devtools-extension) installed, **sweet-state** action's mutators and state can be visible and logged. Just set the `defaults.devtools` to `true`:

```js
import { defaults } from 'react-sweet-state';
defaults.devtools = true;
```

Now every action will be logged along with its name, payload and state changes:

```js
const actions = {
  reset: () => ({ setState }) => {
    // will be logged as "reset" in redux devtools
    setState({ count: 0 });
  },
};
```

Remember: if you want to easily find your stores, you should add the `name` attribute to the [Store configuration object](../api/store.md)
