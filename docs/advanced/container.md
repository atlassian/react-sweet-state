## Containers

By default, you are allowed to have a single Store instance, and they all live in a single global registry. However in large, complex applications you might want to have multiple instances of the same Store type. That's where `Container` component comes into play: it allows you to have multiple instances of the same Store type either globally (so still available app-wide) or just locally (only accessible to children Subscribers/hooks).

```js
// components/counter.js
import {
  createStore,
  createSubscriber,
  createContainer,
} from 'react-sweet-state';

const Store = createStore({
  initialState: { count: 0 },
  actions: {
    increment: () => ({ setState }) => {
      const currentCount = getState().count;
      setState({ count: currentCount + 1 });
    },
  },
});

export const CounterSubscriber = createSubscriber(Store);
export const CounterContainer = createContainer(Store);
```

The default behaviour of a `Container` is to create a locally scoped Store instance (accessible only to it's children) but you can change this behaviour with two props:

- `isGlobal`: which tells the `Container` to act like a transparent link to the "default" instance stored in the global registry
- `scope`: which is a string that makes `Container` create (or get) a global instance "prefixed" with that scope id, so you can have as many global instances as you need

```js
import { CounterContainer, CounterSubscriber } from 'components/counter';

const App = () => (
  <Fragment>
    <CounterContainer isGlobal>
      <CounterSubscriber>
        {({ count }) => count /* this might be 1 */}
      </CounterSubscriber>
    </CounterContainer>

    <CounterContainer scope={'counter-1'}>
      <CounterSubscriber>
        {({ count }) => count /* this might be 2 */}
      </CounterSubscriber>
    </CounterContainer>

    <CounterContainer>
      <CounterSubscriber>
        {/* this instance cannot be accessed elsewhere */}
        {({ count }) => count /* this might be 20 */}
      </CounterSubscriber>
    </CounterContainer>
  </Fragment>
);
```

The power of `Container` is that you can expand or reduce the scope at will, without requiring any change on the children. That means you can start with a local scope and then, if you need to access the same state elsewhere, you can either move `Container` up in the tree or add the `scope` prop to "link" two separate trees.

### Additional properties

Containers enable a couple of additional properties:

#### Scoped data sharing

If two `Container` of the same type have the same `scope` they will share the same data, regardless where they are in the tree.

```js
import { CounterContainer, CounterSubscriber } from 'components/counter';

const App = () => (
  <Fragment>
    <CounterContainer scope={'counter-1'}>
      <CounterSubscriber>
        {({ count }) => count /* if this is 2 */}
      </CounterSubscriber>
    </CounterContainer>

    <CounterContainer scope={'counter-1'}>
      <CounterSubscriber>
        {({ count }) => count /* this will be 2 too */}
      </CounterSubscriber>
    </CounterContainer>
  </Fragment>
);
```

#### Container props are available in actions

Props provided to containers are passed to Store actions as a secondary parameter [see actions API](../api/actions.md).
That makes extreamely easy passing dynamic configuration options to actions.

```js
const Store = createStore({
  initialState: { count: 0 },
  actions: {
    increment: () => ({ setState }, { multiplier = 1 }) => {
      const currentCount = getState().count * multiplier;
      setState({ count: currentCount + 1 });
    },
  },
});

const App = () => (
  <CounterContainer scope={'counter-1'} multiplier={2}>
    <CounterSubscriber>
      {({ count }) => count /* this will be an odd number */}
    </CounterSubscriber>
  </CounterContainer>
);
```

NOTE: Remember though that those props will be available **only** to Subscribers/hooks that are children of the `Container` that receives them, regardless of the Container being global/scoped.

#### Container can trigger actions

`Container` options have a `onInit` and `onUpdate` keys, to trigger actions and update the state on its props change. The methods' shape is the same as all other actions.

```js
const CounterContainer = createContainer(Store, {
  onInit: () => ({ setState }, { initialCount }) => {
    setState({ count: initialCount });
  },
});

const App = () => (
  <CounterContainer scope={'counter-1'} initialCount={10}>
    <CounterSubscriber>
      {({ count }) => count /* this starts from 10 */}
    </CounterSubscriber>
  </CounterContainer>
);
```

#### Scoped data cleanup

Store instances created by `Container`s without `isGlobal` are automatically cleared once the last Container accessing that Store is unmounted.

---

For more details about Containers see the [Containers API](../api/container.md)
