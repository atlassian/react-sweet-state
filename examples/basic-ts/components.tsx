import {
  createStore,
  createSubscriber,
  createHook,
  Action,
} from 'react-sweet-state';

type State = {
  count: number;
};

const initialState: State = {
  count: 0,
};

const actions = {
  increment: (): Action<State> => ({ setState, getState }) => {
    setState({
      count: getState().count + 1,
    });
  },
};

const Store = createStore({
  initialState,
  actions,
});

export const CounterSubscriber = createSubscriber(Store);

export const useCounter = createHook(Store);
