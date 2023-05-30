import {
  createStore,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';
import { ThemingContainer } from './theming';
import { Store as ColorStore, actions as colorActions } from './color';

type State = {
  width: number;
};

const initialState: State = {
  width: 200,
};

const actions = {
  set:
    (width: number) =>
    ({ setState }: StoreActionApi<State>) => {
      setState({ width });
    },
  reset:
    () =>
    ({ setState }: StoreActionApi<State>) => {
      setState(initialState);
    },

  resetAll:
    () =>
    ({ dispatch, dispatchTo }: StoreActionApi<State>) => {
      dispatch(actions.reset());
      dispatchTo(ColorStore, colorActions.reset());
    },
};

const Store = createStore({
  initialState,
  actions,
  containedBy: ThemingContainer,
  handlers: {
    onInit:
      () =>
      ({ setState }, { initialData }) => {
        if (initialData) setState({ width: initialData.width });
      },
  },
});

export const useWidth = createHook(Store);
