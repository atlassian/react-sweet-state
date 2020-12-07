// @flow

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  type ContainerComponent,
  type SubscriberComponent,
  type HookFunction,
} from 'react-sweet-state';
import type { State } from './types';

import * as actions from './actions';

type Actions = typeof actions;
type ContainerProps = { selectedUser: string | null };

const initialState: State = {
  data: null,
  loading: false,
};

const Store = createStore<State, Actions>({
  name: 'todo',
  initialState,
  actions,
});

export const TodoContainer: ContainerComponent<ContainerProps> = createContainer(
  Store,
  {
    onInit: () => ({ dispatch }, { selectedUser }) => {
      if (selectedUser) dispatch(actions.load(selectedUser));
    },
    onUpdate: () => ({ dispatch }, { selectedUser }) => {
      if (selectedUser) dispatch(actions.load(selectedUser));
    },
    onCleanup: () => ({ setState }) => {
      setState(initialState);
    },
  }
);

export const TodoSubscriber: SubscriberComponent<
  State,
  Actions,
  {||}
> = createSubscriber(Store);

export const useTodo: HookFunction<State, Actions, void> = createHook(Store);
