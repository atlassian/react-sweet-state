import {
  createStore,
  createSubscriber,
  createHook,
  StoreActionApi,
} from 'react-sweet-state';

type State = {
  count: number;
};

const initialState: State = {
  count: 0,
};

const actions = {
  increment: () => ({ setState, getState }: StoreActionApi<State>) => {
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
