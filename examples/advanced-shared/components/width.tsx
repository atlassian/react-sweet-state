import {
  createStore,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';
import { ThemingContainer } from './theming';

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
