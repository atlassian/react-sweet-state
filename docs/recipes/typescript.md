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

const Store = createStore({
  initialState,
  actions,
  containedBy: CounterContainer,
});

const useCounter = createHook(Store);
const CounterSubscriber = createSubscriber(Store);
```

You should not need to manually type methods, as TS can correctly infer most times.

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
const selector = (state: State) => state.count > 0;

// this hook does not accept arguments
const useCounter = createHook(Store, { selector });

// this component does not accept props
const CounterSubscriber = createSubscriber(Store, { selector });
```

In case your component/hook also needs some props:

```js
type SelectorProps = { min: number };
const selector = (state: State, props: SelectorProps) => state.count > props.min;

// this hook requires an argument
const useCounter = createHook(Store, { selector });

// this component requires props
const CounterSubscriber = createSubscriber(Store, { selector });
```

#### createContainer patterns

If your container requires additional props:

```js
type ContainerProps = { multiplier: number };

// this component requires props
const CounterContainer = createContainer<ContainerProps>();
```
