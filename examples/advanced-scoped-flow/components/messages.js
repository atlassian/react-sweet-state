// @flow

import {
  createStore,
  createSubscriber,
  createActionsHook,
  createValueHook,
  type Action,
  type SubscriberComponent,
  type HookActionsFunction,
  type HookValueFunction,
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
  add:
    (message: string): Action<State> =>
    ({ setState, getState }) => {
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

export const MessagesSubscriber: SubscriberComponent<State, Actions> =
  createSubscriber(Store);

export const useMessagesValue: HookValueFunction<State> =
  createValueHook(Store);

export const useMessagesActions: HookActionsFunction<Actions> =
  createActionsHook<State, Actions>(Store);
