// @flow

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  createStateHook,
  type ContainerComponent,
  type SubscriberComponent,
  type HookFunction,
  type HookStateFunction,
} from 'react-sweet-state';
import type { State } from './types';

import * as actions from './actions';
import * as selectors from './selectors';

type Actions = typeof actions;
type UserSelectedState = $Call<typeof selectors.getSelected, State>;

const initialState: State = {
  selected: null,
  data: null,
  loading: false,
};

const Store = createStore<State, Actions>({
  name: 'user',
  initialState,
  actions,
});

export const UserContainer: ContainerComponent<void> = createContainer(Store, {
  onInit: actions.load,
});

export const UserSubscriber: SubscriberComponent<State, Actions> =
  createSubscriber(Store);

export const UserSelectedSubscriber: SubscriberComponent<
  UserSelectedState,
  Actions,
> = createSubscriber(Store, {
  selector: selectors.getSelected,
});

export const useUser: HookFunction<State, Actions> = createHook(Store);

export const useUserSelected: HookStateFunction<UserSelectedState> =
  createStateHook(Store, {
    selector: selectors.getSelected,
  });
