## Typing sweet-state with TypeScript

This is a basic example:

```ts
import {
  createStore,
  createSubscriber,
  createHook,
  createContainer,
  Action,
} from 'react-sweet-state';

type State = { count: number };
type Actions = typeof actions;

const initialState: State = {
  count: 0,
};

const actions = {
  increment:
    (by = 1): Action<State> =>
    ({ setState, getState }) => {
      setState({
        count: getState().count + by,
      });
    },
};

const CounterContainer = createContainer();

// Note: most times TS will be able to infer the generics
const Store = createStore<State, Actions>({
  initialState,
  actions,
  containedBy: CounterContainer,
});

const CounterSubscriber = createSubscriber(Store);
const useCounter = createHook(Store);
```

You don't have to manually type all the `create*` methods, as they can be inferred for most use cases.

#### Actions patterns

If your actions require `Container` props:

```ts
type ContainerProps = { multiplier: number };

const actions = {
  increment:
    (by = 1): Action<State, ContainerProps> =>
    ({ setState, getState }, { multiplier }) => {
      setState({ count: getState().count + by * multiplier });
    },
};
```

#### createHook / createSubscriber patterns

If you provide a selector to your components, you need to define two additional TypeScript arguments on `createHook`/`createSubscriber`: the selector output and the selector props.

```js
type SelectorState = boolean;
const selector = (state: State): SelectorState => state.count > 0;

// this hook does not accept arguments
const useCounter = createHook<State, Actions, SelectorState, void>(Store, {
  selector
});

// this component does not accept props
const CounterSubscriber = createSubscriber<State, Actions, SelectorState, void>(Store, {
  selector
});
```

In case your component/hook also needs some props, you can define them as the fourth argument:

```js
type SelectorProps = { min: number };
type SelectorState = boolean;
const selector = (state: State, props: SelectorProps): SelectorState => state.count > props.min;

// this hook requires an argument
const useCounter = createHook<State, Actions, SelectorState, SelectorProps>(Store, {
  selector
});

// this component requires props
const CounterSubscriber = createSubscriber<State, Actions, SelectorState, SelectorProps>(Store, {
  selector
});
```

#### createContainer patterns

If your container requires additional props:

```js
type ContainerProps = { multiplier: number };

// this component requires props
const CounterContainer = createContainer<ContainerProps>();
```
