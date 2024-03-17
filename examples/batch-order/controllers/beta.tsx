import {
  StoreActionApi,
  createStore,
  createContainer,
  createStateHook,
  defaults,
} from 'react-sweet-state';

type Props = {
  input: number;
};

type State = {
  ouput: number | undefined;
};

type StoreAPI = StoreActionApi<State>;

const init =
  () =>
  ({ setState }: StoreAPI, { input }: Props) => {
    console.log('===== updating beta', input);
    setState({ ouput: input });
    if (input > 0) throw new Error('');
  };

const actions = {};

const Store = createStore<State, typeof actions>({
  initialState: { ouput: undefined },
  actions,
  name: 'beta',
});

export const BetaContainer = createContainer<State, typeof actions, Props>(
  Store,
  {
    displayName: 'BetaContainer',
    onInit: init,
    onUpdate: init,
  }
);

export const useBetaValue = createStateHook(Store, {
  selector: (state) => state.ouput,
});
