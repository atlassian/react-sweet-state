#### Middlewares

sweet-state supports Redux-like middlewares. They can be added via `defaults.middlewares`.

```js
import { defaults } from 'react-sweet-state';

const logger = storeState => next => fn => {
  console.log('Updating', storeState.key);
  const result = next(fn);
  console.log('Changed', result.changes);
  return result;
};

defaults.middlewares.add(logger);
```
