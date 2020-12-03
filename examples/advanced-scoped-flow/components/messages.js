// @flow

import {
  createStore,
  createSubscriber,
  createHook,
  type Action,
  type SubscriberComponent,
  type HookFunction,
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
  add: (message: string): Action<State> => ({ setState, getState }) => {
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

export const MessagesSubscriber: SubscriberComponent<
  State,
  Actions
> = createSubscriber(Store);

export const useMessages: HookFunction<State, Actions> = createHook(Store);
