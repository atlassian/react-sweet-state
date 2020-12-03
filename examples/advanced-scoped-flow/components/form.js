// @flow

import {
  createStore,
  createContainer,
  createSubscriber,
  createHook,
  type Action,
  type ContainerComponent,
  type SubscriberComponent,
  type HookFunction,
} from 'react-sweet-state';

type State = {
  message: string,
  isValid: boolean,
  isSending: boolean,
  toUsers: number,
};
type Actions = typeof actions;

type ContainerProps = {|
  remoteUsers: number,
|};

const initialState: State = {
  message: '',
  isValid: false,
  isSending: false,
  toUsers: 0,
};

const actions = {
  input: (value: string): Action<State> => ({ setState }) => {
    setState({
      message: value,
      isValid: value.length > 0,
    });
  },

  send: (): Action<State, {}, Promise<void>> => async ({ setState }) => {
    setState({
      isSending: true,
    });
    await new Promise((r) => setTimeout(r, 1000));
    setState({
      isSending: false,
      message: '',
    });
  },
};

const Store = createStore<State, Actions>({
  name: 'form',
  initialState,
  actions,
});

export const FormContainer: ContainerComponent<ContainerProps> = createContainer(
  Store,
  {
    onUpdate: () => ({ setState }, { remoteUsers }) => {
      setState({ toUsers: remoteUsers });
    },
  }
);

export const FormSubscriber: SubscriberComponent<
  State,
  Actions
> = createSubscriber(Store);

export const useForm: HookFunction<State, Actions> = createHook(Store);

export const FormActions: SubscriberComponent<
  void,
  Actions
> = createSubscriber(Store, { selector: null });

export const useFormActions: HookFunction<void, Actions> = createHook(Store, {
  selector: null,
});
