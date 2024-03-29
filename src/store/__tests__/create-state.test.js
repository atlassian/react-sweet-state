/* eslint-env jest */

import { storeStateMock } from '../../__tests__/mocks';
import defaults from '../../defaults';
import supports from '../../utils/supported-features';
import createStoreState from '../create-state';

const initialState = { count: 0 };

describe('createStoreState', () => {
  it('should return a store object', () => {
    const store = createStoreState(storeStateMock.key, initialState);
    expect(store).toEqual({
      key: storeStateMock.key,
      getState: expect.any(Function),
      setState: expect.any(Function),
      resetState: expect.any(Function),
      notify: expect.any(Function),
      subscribe: expect.any(Function),
      listeners: expect.any(Function),
      mutator: expect.any(Function),
    });
  });

  describe('getState()', () => {
    it('should return current state', () => {
      const store = createStoreState(storeStateMock.key, initialState);
      expect(store.getState()).toBe(initialState);
    });
  });

  describe('setState()', () => {
    it('should replace current state', () => {
      const store = createStoreState(storeStateMock.key, initialState);
      const newState = { count: 1 };
      store.setState(newState);
      expect(store.getState()).toBe(newState);
    });

    it('should notify listeners when multiple calls', () => {
      const store = createStoreState(storeStateMock.key, initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      store.setState({ count: 1 });
      store.setState({ count: 2 });
      store.setState({ count: 3 });
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it('should schedule updates when env supports it', async () => {
      const supportsMock = jest
        .spyOn(supports, 'scheduling')
        .mockReturnValue(true);
      defaults.batchUpdates = true;

      const store = createStoreState(storeStateMock.key, initialState);
      const listener = jest.fn();
      store.subscribe(listener);

      store.setState({ count: 1 });
      store.setState({ count: 2 });
      store.setState({ count: 3 });
      // scheduler uses timeouts on non-browser envs
      await new Promise((r) => setTimeout(r, 10));

      expect(listener).toHaveBeenCalledTimes(1);

      supportsMock.mockRestore();
    });
  });

  describe('resetState()', () => {
    it('should replace current state with initial state', async () => {
      const store = createStoreState(storeStateMock.key, initialState);
      store.setState({ count: 1 });
      const listener = jest.fn();
      store.subscribe(listener);
      store.resetState();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('notify()', () => {
    it('should notify listeners', () => {
      const store = createStoreState(storeStateMock.key, initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      store.notify();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribe()', () => {
    it('should remove listener', () => {
      const store = createStoreState(storeStateMock.key, initialState);
      const newState = { count: 1 };
      const listener = jest.fn();
      const unsubscribe = store.subscribe(listener);
      unsubscribe();
      store.setState(newState);
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('mutator()', () => {
    it('should modify state', () => {
      const store = createStoreState(storeStateMock.key, initialState);
      store.mutator({
        count: 1,
      });
      expect(store.getState()).toEqual({ count: 1 });
    });
  });
});
