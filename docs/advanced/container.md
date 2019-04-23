## Containers

By default, you are allowed to have a single Store instance, and they all live in a single global registry. However in large, complex applications you might want to have multiple instances of the same Store type. That's where `Container` component comes into play: it allows you to have multiple global instances of the same Store type (so still available app-wide) or even local only instances (only accessible to children Subscribers/hooks).

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

- If two Container of the same time have the same `scope` they will share the same data
- Store instances created by Containers without `isGlobal` are automatically cleared once the last Container accessing that Store is unmounted
- Props provided to containers are passed to Store actions as second parameter [see actions API](../api/actions.md)
- Containers can have a `onInit` and `onUpdate` methods to trigger actions and update the state on Container props change

For more details about Containers see the [Containers API](../api/container.md)
