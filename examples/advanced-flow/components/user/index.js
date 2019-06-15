// @flow

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
} from 'react-sweet-state';
import type { State } from './types';

import * as actions from './actions';
import * as selectors from './selectors';

type Actions = typeof actions;
type ContainerProps = {||};
type UserSelectedState = $Call<typeof selectors.getSelected, State>;

const initialState: State = {
  selected: null,
  data: null,
  loading: false,
};

const Store = createStore<State, Actions>({
  initialState,
  actions,
});

export const UserContainer = createContainer<State, Actions, ContainerProps>(
  Store,
  {
    onInit: actions.load,
  }
);

export const UserSubscriber = createSubscriber<State, Actions>(Store);

export const UserSelectedSubscriber = createSubscriber<
  State,
  Actions,
  UserSelectedState,
  void
>(Store, {
  selector: selectors.getSelected,
});

export const useUser = createHook<State, Actions>(Store);

export const useUserSelected = createHook<
  State,
  Actions,
  UserSelectedState,
  void
>(Store, { selector: selectors.getSelected });
