#### Performance tips

##### Aggressive updates batching

This library implements a smart debounce and batch update mechanism, that should play very well with React Concurrent Mode. It is currently disabled by default, but if you want to enable it just add:

```js
import { defaults } from 'react-sweet-state';
defaults.batchUpdates = true;
```

This batching capability will await util next tick to flush updates to all stores. It means that if you update any number of stores in the same cycle (even across `useEffects`), `react-sweet-state` will dispatch only one update to the components that will all render in one go. For repeated items and effects, this changes the cost of updates from O(n) to O(1).
