#### Custom mutator

**sweet-state** allows you to override the default mutator via `defaults.mutator`. The built-in implementation is quite simple:

```js
const defaultMutator = (currentState, partialState) => {
  // Merge the partial state and the previous state and return a new object
  return Object.assign({}, currentState, partialState);
};
```

But you can override it with your own implementation, for instance using [immer](https://github.com/mweststrate/immer):

```js
import { defaults } from 'react-sweet-state';
import { produce } from 'immer';

defaults.mutator = (currentState, producer) => produce(currentState, producer);
```

The second argument of the mutator is the parameter you call `setState` with, so it can be anything. For immer it has to be a function, so `setState` will now be called with a producer function instead of a partial state object:

```js
const actions = {
  increment: (n) => ({ setState }) => {
      setState(draft => {
        draft.count += n;
      });
    };
  },
};
```

NOTE: if you are using Typescript you will need to overload `SetState` interface otherwise TS will complain. To do that, in your project `types` folder (or where your `typeRoots` config gets additional `d.ts` files) add `react-sweet-state.d.ts` with:

```ts
declare module 'react-sweet-state' {
  // this allows setState to be called with a function instead of allowing only Partial<TState>
  interface SetState<TState> {
    (producer: (draftState: TState) => void): void;
  }
}
```
