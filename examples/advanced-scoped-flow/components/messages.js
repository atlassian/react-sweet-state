// @flow

import {
  createStore,
  createSubscriber,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';

type State = {
  data: string[],
  loading: boolean,
};

type Actions = typeof actions;

const initialState: State = {
  data: [],
  loading: false,
};

const actions = {
  add: (message: string) => ({ setState, getState }: StoreActionApi<State>) => {
    setState({
      data: [...getState().data, message],
    });
  },
};

const Store = createStore<State, Actions>({
  name: 'messages',
  initialState,
  actions,
});

export const MessagesSubscriber = createSubscriber<State, Actions>(Store);

export const useMessages = createHook<State, Actions>(Store);
