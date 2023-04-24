import {
  createStore,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';

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
  tags: ['theme'],
});

export const useColor = createHook(Store);
