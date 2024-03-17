import {
  StoreActionApi,
  createStore,
  createContainer,
  createStateHook,
  createActionsHook,
} from 'react-sweet-state';

type State = {
  value: number;
};

type StoreAPI = StoreActionApi<State>;

const setValue =
  (value: number) =>
  ({ setState }: StoreAPI) => {
    setState({ value });
  };

const actions = { setValue };

const Store = createStore<State, typeof actions>({
  initialState: { value: 0 },
  actions,
  name: 'alpha',
});

export const AlphaContainer = createContainer<State, typeof actions>(Store, {
  displayName: 'AlphaContainer',
});

export const useAlphaValue = createStateHook(Store, {
  selector: (state: State) => state.value,
});

export const useAlphaActions = createActionsHook(Store);
