/* eslint-env jest */

import { storeStateMock } from '../../__tests__/mocks';
import withDevtools from '../devtools';
import defaults from '../../defaults';

window.__REDUX_DEVTOOLS_EXTENSION__ = {
  connect: jest.fn(),
  send: jest.fn(),
};

const devToolsMock = {
  init: jest.fn(),
  subscribe: jest.fn(),
  send: jest.fn(),
};

describe('withDevtools', () => {
  let createStoreMock;

  beforeEach(() => {
    defaults.devtools = true;
    createStoreMock = jest.fn().mockReturnValue({ ...storeStateMock });
    window.__REDUX_DEVTOOLS_EXTENSION__.connect.mockReturnValue(devToolsMock);
  });

  it('should return an enhanced store object', () => {
    const store = withDevtools(createStoreMock)();

    expect(store).toEqual(
      expect.objectContaining({
        key: storeStateMock.key,
        getState: expect.any(Function),
        setState: expect.any(Function),
        mutator: expect.any(Function),
      })
    );
  });

  it('should enhance mutator, calling original one too', () => {
    const store = withDevtools(createStoreMock)();
    store.mutator({ count: 1 });
    expect(storeStateMock.mutator).toHaveBeenCalledWith({ count: 1 });
  });

  it('should connect to devtools extension on mutator execution', () => {
    storeStateMock.getState.mockReturnValue({ count: 0 });
    const store = withDevtools(createStoreMock)();
    store.mutator({ count: 1 });

    expect(window.__REDUX_DEVTOOLS_EXTENSION__.connect).toHaveBeenCalledWith({
      name: 'Store store-key',
      serialize: true,
    });
    expect(devToolsMock.init).toHaveBeenCalledWith({ count: 0 });
    expect(devToolsMock.subscribe).toHaveBeenCalled();
  });

  it('should allow to custom devtools settings', () => {
    defaults.devtools = (storeState) => ({
      name: `CustomStore ${storeState.key[0]}`,
      stateSanitizer: jest.fn(),
    });
    storeStateMock.getState.mockReturnValue({ count: 0 });
    const store = withDevtools(createStoreMock)();
    store.mutator({ count: 1 });

    expect(window.__REDUX_DEVTOOLS_EXTENSION__.connect).toHaveBeenCalledWith({
      name: 'CustomStore store-key',
      serialize: true,
      stateSanitizer: expect.any(Function),
    });
  });

  it('should send action and store state details to devtools extension on mutator execution', () => {
    storeStateMock.getState.mockReturnValue({ count: 1 });
    const store = withDevtools(createStoreMock)();
    store.mutator.actionName = 'increment';
    store.mutator({ count: 1 });

    expect(devToolsMock.send).toHaveBeenCalledWith(
      {
        type: 'increment',
        payload: { count: 1 },
      },
      { count: 1 },
      {},
      storeStateMock.key
    );
  });

  describe('devtools extension interactions', () => {
    let subscriber;

    beforeEach(() => {
      storeStateMock.getState.mockReturnValue({ count: 1 });
      const store = withDevtools(createStoreMock)();
      store.mutator({ count: 1 });
      subscriber = devToolsMock.subscribe.mock.calls[0][0];
    });

    it('should handle RESET', () => {
      const message = { type: 'DISPATCH', payload: { type: 'RESET' } };
      subscriber(message);
      expect(storeStateMock.resetState).toHaveBeenCalled();
      expect(devToolsMock.init).toHaveBeenCalledWith({ count: 1 });
    });

    it('should handle COMMIT', () => {
      const message = { type: 'DISPATCH', payload: { type: 'COMMIT' } };
      subscriber(message);
      expect(devToolsMock.init).toHaveBeenCalledWith({ count: 1 });
    });

    it('should handle ROLLBACK', () => {
      storeStateMock.getState.mockReturnValue({ count: 0 });
      const message = {
        type: 'DISPATCH',
        payload: { type: 'ROLLBACK' },
        state: '{"count":0}',
      };
      subscriber(message);
      expect(storeStateMock.setState).toHaveBeenCalledWith({ count: 0 });
      expect(devToolsMock.init).toHaveBeenCalledWith({ count: 0 });
    });

    it('should handle JUMP_TO', () => {
      const message = {
        type: 'DISPATCH',
        payload: { type: 'JUMP_TO_ACTION' },
        state: '{"count":0}',
      };
      subscriber(message);
      expect(storeStateMock.setState).toHaveBeenCalledWith({ count: 0 });
    });

    it('should handle custom ACTION payload', () => {
      const message = {
        type: 'ACTION',
        payload: '{ "type": "", "payload": { "count" : 0 } }',
      };
      subscriber(message);
      expect(storeStateMock.setState).toHaveBeenCalledWith({ count: 0 });
    });
  });
});
