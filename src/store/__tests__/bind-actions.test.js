/* eslint-env jest */

import { actionsMock, storeStateMock, StoreMock } from '../../__tests__/mocks';
import { bindAction, bindActions } from '../bind-actions';
import defaults from '../../defaults';

jest.mock('../../defaults');

const createConfigArg = ({ props = {}, retrieveStore = () => null } = {}) => ({
  props: () => props,
  contained: () => false,
  retrieveStore,
});

describe('bindAction', () => {
  it('should bind and call providing mutator, getState and container props', () => {
    const actionInner = jest.fn();
    const action = jest.fn().mockReturnValue(actionInner);
    const containerProps = { url: '' };

    const result = bindAction(
      storeStateMock,
      action,
      'myAction',
      createConfigArg({ props: containerProps }),
      actionsMock
    );
    result(1, '2', 3);

    expect(action).toHaveBeenCalledWith(1, '2', 3);
    // silence console warn on actions getter
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(actionInner).toHaveBeenCalledWith(
      {
        setState: expect.any(Function),
        getState: storeStateMock.getState,
        actions: expect.objectContaining({
          increase: expect.any(Function),
          decrease: expect.any(Function),
        }),
        dispatch: expect.any(Function),
        dispatchTo: expect.any(Function),
      },
      containerProps
    );
  });

  it('should expose action name to devtools on action call', () => {
    defaults.devtools = true;
    const action =
      () =>
      ({ setState }) =>
        setState();
    const result = bindAction(
      storeStateMock,
      action,
      'myAction',
      createConfigArg()
    );
    result();

    expect(storeStateMock.mutator.actionName).toEqual('myAction');
  });

  it('should expose action name to devtools on dispatch call', () => {
    defaults.devtools = true;
    const action2 =
      () =>
      ({ setState }) =>
        setState();
    const action =
      () =>
      ({ dispatch }) =>
        dispatch(action2());
    const result = bindAction(
      storeStateMock,
      action,
      'myAction2',
      createConfigArg()
    );
    result();

    expect(storeStateMock.mutator.actionName).toEqual('myAction2.dispatch');
  });

  it('should expose action name to devtools on dispatchTo call', () => {
    defaults.devtools = true;
    const Store2 = { ...StoreMock, key: 'store2-key' };
    const action2 =
      () =>
      ({ setState }) =>
        setState();
    const action =
      () =>
      ({ dispatchTo }) =>
        dispatchTo(Store2, action2());

    const retrieveStore = () => ({
      storeState: { ...storeStateMock, key: 'store2-key' },
      actions: { ...Store2.actions },
    });

    const result = bindAction(
      storeStateMock,
      action,
      'myAction2',
      createConfigArg({ retrieveStore }),
      actionsMock
    );
    result();

    expect(storeStateMock.mutator.actionName).toEqual('myAction2.dispatchTo');
  });

  it('should work recursively', () => {
    defaults.devtools = true;
    const Store2 = { ...StoreMock, key: 'store2-key' };
    const action3 =
      () =>
      ({ setState }) =>
        setState({});
    const action2 =
      () =>
      ({ dispatch }) =>
        dispatch(action3());
    const action =
      () =>
      ({ dispatchTo }) =>
        dispatchTo(Store2, action2());
    const retrieveStore = () => ({
      storeState: { ...storeStateMock, key: 'store2-key' },
      actions: { ...Store2.actions },
    });

    const result = bindAction(
      storeStateMock,
      action,
      'myAction2',
      createConfigArg({ retrieveStore }),
      actionsMock
    );
    result();

    expect(storeStateMock.mutator.actionName).toEqual(
      'myAction2.dispatchTo.dispatch'
    );
  });
});

describe('bindActions', () => {
  it('should return all actions bound', () => {
    const result = bindActions(actionsMock, storeStateMock, createConfigArg());
    expect(result).toEqual({
      increase: expect.any(Function),
      decrease: expect.any(Function),
    });
  });

  it('should return actions object with actions bound', () => {
    const state = { data: null };
    jest.spyOn(storeStateMock, 'getState').mockReturnValue(state);
    actionsMock.increase.mockReturnValue(({ dispatch }) =>
      dispatch(actionsMock.decrease())
    );
    actionsMock.decrease.mockReturnValue(({ getState }) => getState());
    const result = bindActions(actionsMock, storeStateMock, createConfigArg());
    const output = result.increase();

    expect(output).toEqual(state);
  });
});
