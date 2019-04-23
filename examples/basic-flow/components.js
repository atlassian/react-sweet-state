// @flow

import {
  createStore,
  createSubscriber,
  createHook,
  type Action,
} from 'react-sweet-state';

type State = {
  count: number,
};

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

export const CounterSubscriber = createSubscriber<State, Actions>(Store);

export const useCounter = createHook<State, Actions>(Store);
