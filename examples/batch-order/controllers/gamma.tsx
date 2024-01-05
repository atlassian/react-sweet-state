import {
  StoreActionApi,
  createStore,
  createContainer,
  createStateHook,
} from 'react-sweet-state';

type Props = {
  input: number | undefined;
};

type State = {
  ouput: number | undefined;
};

type StoreAPI = StoreActionApi<State>;

const init =
  () =>
  ({ setState }: StoreAPI, { input }: Props) => {
    console.log('===== updating gamma');
    setState({ ouput: input });
  };

const actions = {};

const Store = createStore<State, typeof actions>({
  initialState: { ouput: undefined },
  actions,
  name: 'gamma',
});

export const GammaContainer = createContainer<State, typeof actions, Props>(
  Store,
  {
    displayName: 'GammaContainer',
    onInit: init,
    onUpdate: init,
  }
);

export const useGammaValue = createStateHook(Store, {
  selector: (state) => state.ouput,
});
