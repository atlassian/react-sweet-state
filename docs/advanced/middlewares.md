#### Middlewares

**sweet-state** supports Redux-like middlewares. They can be added via `defaults.middlewares`.

```js
import { defaults } from 'react-sweet-state';

const logger = storeState => next => arg => {
  console.log(storeState.key, 'payload: ', arg);
  const result = next(arg);
  console.log(storeState.key, ':', storeState.getState());
  return result;
};

defaults.middlewares.add(logger);
```
