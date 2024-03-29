import {
  createStore,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';
import { ThemingContainer } from './theming';

type State = {
  color: string;
};

const initialState: State = {
  color: 'white',
};

const actions = {
  set:
    (color: string) =>
    ({ setState }: StoreActionApi<State>) => {
      setState({ color });
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
        if (initialData) setState({ color: initialData.color });
      },
  },
});

export const useColor = createHook(Store);
