// @flow

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  type Action,
  type ContainerComponent,
  type SubscriberComponent,
  type HookFunction,
} from 'react-sweet-state';

type State = {
  color: string,
};

type Actions = typeof actions;

type ContainerProps = {|
  defaultColor: string,
|};

const initialState: State = {
  color: '',
};

const actions = {
  change: (value?: string): Action<State, ContainerProps> => (
    { setState },
    { defaultColor }
  ) => {
    setState({
      color: value || defaultColor,
    });
  },
};

const Store = createStore<State, Actions>({
  name: 'theme',
  initialState,
  actions,
});

export const ThemeContainer: ContainerComponent<ContainerProps> = createContainer(
  Store,
  {
    onInit: () => ({ getState, dispatch }) => {
      // this gets currently called also when component remounts
      // so it is important to check state status and apply default only on first mount
      const { color } = getState();
      if (!color) {
        dispatch(actions.change());
      }
    },
  }
);

export const ThemeSubscriber: SubscriberComponent<
  State,
  Actions
> = createSubscriber(Store);

export const useTheme: HookFunction<State, Actions> = createHook(Store);
