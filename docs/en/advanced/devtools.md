#### Devtools

If you have [Redux Devtools extension](https://github.com/zalmoxisus/redux-devtools-extension) installed, sweet-state action's mutators and state will be visible there:

```js
const actions = {
  reset: () => setState => {
    // will be logged as "reset" in redux devtools
    setState({ count: 0 });
  },
};
```

If you want to turn devtools off (for instance on prod), just set the `defaults.devtools` to `false`:

```js
import { defaults } from 'react-sweet-state';
defaults.devtools = false;
```
