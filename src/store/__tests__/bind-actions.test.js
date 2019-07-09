/* eslint-env jest */

import { actionsMock, storeStateMock } from '../../__tests__/mocks';
import { bindAction, bindActions } from '../bind-actions';
import defaults from '../../defaults';

jest.mock('../../defaults');

describe('bindAction', () => {
  it('should bind and call providing mutator, getState and container props', () => {
    const actionInner = jest.fn();
    const action = jest.fn().mockReturnValue(actionInner);
    const containerProps = { url: '' };

    const result = bindAction(
      storeStateMock,
      action,
      'myAction',
      () => containerProps,
      actionsMock
    );
    result(1, '2', 3);

    expect(action).toHaveBeenCalledWith(1, '2', 3);
    expect(actionInner).toHaveBeenCalledWith(
      {
        setState: expect.any(Function),
        getState: storeStateMock.getState,
        actions: expect.objectContaining({
          increase: expect.any(Function),
          decrease: expect.any(Function),
        }),
        dispatch: expect.any(Function),
      },
      containerProps
    );
  });

  it('should expose action name to devtools on action call', () => {
    defaults.devtools = true;
    const action = () => ({ setState }) => setState();
    const result = bindAction(storeStateMock, action, 'myAction');
    result();

    expect(storeStateMock.mutator.actionName).toEqual('myAction');
  });

  it('should expose action name to devtools on dispatch call', () => {
    defaults.devtools = true;
    const action2 = () => ({ setState }) => setState();
    const action = () => ({ dispatch }) => dispatch(action2());
    const result = bindAction(storeStateMock, action, 'myAction2');
    result();

    expect(storeStateMock.mutator.actionName).toEqual('myAction2.dispatch');
  });
});

describe('bindActions', () => {
  it('should return all actions bound', () => {
    const result = bindActions(actionsMock, storeStateMock);
    expect(result).toEqual({
      increase: expect.any(Function),
      decrease: expect.any(Function),
    });
  });

  it('should return actions object with actions bound', () => {
    const state = { data: null };
    storeStateMock.getState.mockReturnValue(state);
    actionsMock.increase.mockReturnValue(({ actions }) => actions.decrease());
    actionsMock.decrease.mockReturnValue(({ getState }) => getState());
    const result = bindActions(actionsMock, storeStateMock);
    const output = result.increase();

    expect(output).toEqual(state);
  });
});
