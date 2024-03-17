import { createStore, createHook, defaults, Action } from 'react-sweet-state';

defaults.unstable_concurrent = false;

type State = {
  count: number;
};

const initialState: State = {
  count: 0,
};

const actions = {
  increment:
    (): Action<State> =>
    ({ setState, getState }) => {
      setState({
        count: getState().count + 1,
      });
    },
};

const Store = createStore({
  initialState,
  actions,
});

export const useCounter = createHook(Store);
