#### Performance tips

##### Batching updates

One of the methods exported is `batch`, which enables state updates to be batched across multiple store updates (if `batchUpdates` global setting is off) and react state. That is valuable way to ensure state consistency in case multiple updates need to happen at the same time without trigger multiple re-renders.
There are already places, like events callback, where React batches updates automatically, and React 18+ is supposed to batch state updates by default, so this method should be used sporadically and only when strongly needed.

```js
import { batch } from 'react-sweet-state';

const MyComponent = () => {
  const [state, actions] = useCounter();
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    // this will trigger just one re-render instead of 3
    batch(() => {
      setChanging(true);
      actions.increment();
      setChanging(false);
    });
  }, []);
};
```

##### Aggressive updates batching

On top of manual batching, this library implements a smart debounce and batch update mechanism, that should play very well with React Concurrent Mode. It is currently disabled by default, but if you want to enable it just add:

```js
import { defaults } from 'react-sweet-state';
defaults.batchUpdates = true;
```

This batching capability will hook into React Scheduler, and wait util next tick (or scheduled re-render) to flush updates to all stores. It means that if you update any number of stores in the same cycle (even across `useEffects`), `react-sweet-state` will dispatch at most one update to the components that will all render in one go, and no additional one for components that React was already about to re-render. For repeated items and effects, this changes the cost of updates from O(n) to O(1).
