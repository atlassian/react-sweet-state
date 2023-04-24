import {
  createStore,
  createHook,
  type StoreActionApi,
} from 'react-sweet-state';

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
  tags: ['theme'],
});

export const useWidth = createHook(Store);
