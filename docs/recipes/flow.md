## Typing **sweet-state** with Flow

This is a basic example:

```js
import {
  createStore,
  createSubscriber,
  createHook,
  createContainer,
  type Action,
  type ContainerComponent,
  type HookFunction,
  type SubscriberComponent,
} from 'react-sweet-state';

type State = { count: number };
type Actions = typeof actions;

const initialState: State = {
  count: 0,
};

const actions = {
  increment:
    (by = 1): Action<Store> =>
    ({ setState, getState }) => {
      setState({
        count: getState().count + by,
      });
    },
};

const CounterContainer: ContainerComponent<{}> = createContainer();

const Store = createStore<State, Actions>({
  containedBy: CounterContainer,
  initialState,
  actions,
});

const CounterSubscriber: SubscriberComponent<State, Actions> =
  createSubscriber(Store);
const useCounter: HookFunction<State, Actions> = createHook(Store);
```

#### Actions pattern

If your actions require `Container` props, just type the second argument:

```js
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

If you provide a selector to your components, you need to define two additional flow arguments on `createHook`/`createSubscriber`: the selector output and the selector props.

```js
type SelectorState = boolean;
const selector = (state: State): SelectorState => state.count > 0;

// this hook does not accept arguments
const useCounter: HookFunction<SelectorState, Actions> = createHook(Store, {
  selector,
});

// this component does not accept props
const CounterSubscriber: SubscriberComponent<SelectorState, Actions> =
  createSubscriber(Store, {
    selector,
  });
```

In case your component/hook also needs some props, you can define them as the fourth argument:

```js
type SelectorProps = { min: number };
type SelectorState = boolean;
const selector = (state: State, props: SelectorProps): SelectorState => state.count > props.min;

// this hook requires an argument
const useCounter: HookFunction<SelectorState, Actions, SelectorProps> = createHook(Store {
  selector,
});

// this component requires props
const CounterSubscriber: SubscriberComponent<SelectorState, Actions, SelectorProps> = createSubscriber(Store, {
  selector,
});
```

For `createStateHook` and `createActionsHook` there are specific return types too:

```js
// this hook requires an argument
const useCounterGreater: HookStateFunction<SelectorState, SelectorProps> = createHook(Store {
  selector,
});

const useCounterActions: HookActionsFunction<Actions> = createHook(Store {
  selector,
});
```

#### createContainer patterns

If your container requires additional props:

```js
type ContainerProps = { multiplier: number };

// this component requires props
const CounterContainer: ContainerComponent<ContainerProps> = createContainer();
```
