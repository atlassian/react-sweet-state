// @flow

import {
  createStore,
  createSubscriber,
  createHook,
  type Action,
  type SubscriberComponent,
  type HookFunction,
} from 'react-sweet-state';

type State = {|
  count: number,
|};

type Actions = typeof actions;

const initialState: State = {
  count: 0,
};

const actions = {
  increment: (): Action<State> => ({ setState, getState }) => {
    setState({
      count: getState().count + 1,
    });
  },
};

const Store = createStore<State, Actions>({
  initialState,
  actions,
});

export const CounterSubscriber: SubscriberComponent<
  State,
  Actions
> = createSubscriber(Store);

export const useCounter: HookFunction<State, Actions> = createHook(Store);
