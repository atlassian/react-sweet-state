/* eslint-env jest */

import { storeStateMock } from '../../__tests__/mocks';
import createStore from '../create-state';
import defaults from '../../defaults';

const initialState = { count: 0 };

describe('createStore', () => {
  it('should return a store object', () => {
    const store = createStore(storeStateMock.key, initialState);
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
      const store = createStore(storeStateMock.key, initialState);
      expect(store.getState()).toBe(initialState);
    });
  });

  describe('setState()', () => {
    it('should replace current state', () => {
      const store = createStore(storeStateMock.key, initialState);
      const newState = { count: 1 };
      store.setState(newState);
      expect(store.getState()).toBe(newState);
    });

    it('should notify listeners when multiple calls', () => {
      const store = createStore(storeStateMock.key, initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      store.setState({ count: 1 });
      store.setState({ count: 2 });
      store.setState({ count: 3 });
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it('should batch notify listeners when setting enabled', async () => {
      defaults.batchUpdates = true;
      const store = createStore(storeStateMock.key, initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      store.setState({ count: 1 });
      store.setState({ count: 2 });
      store.setState({ count: 3 });
      await Promise.resolve();
      expect(listener).toHaveBeenCalledTimes(1);
      defaults.batchUpdates = false;
    });
  });

  describe('resetState()', () => {
    it('should replace current state with initial state', async () => {
      const store = createStore(storeStateMock.key, initialState);
      store.setState({ count: 1 });
      const listener = jest.fn();
      store.subscribe(listener);
      store.resetState();
      expect(listener).toHaveBeenCalledWith(initialState, store);
    });
  });

  describe('notify()', () => {
    it('should notify listeners', () => {
      const store = createStore(storeStateMock.key, initialState);
      const listener = jest.fn();
      store.subscribe(listener);
      store.notify();
      expect(listener).toHaveBeenCalledWith(initialState, store);
    });
  });

  describe('unsubscribe()', () => {
    it('should remove listener', () => {
      const store = createStore(storeStateMock.key, initialState);
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
      const store = createStore(storeStateMock.key, initialState);
      store.mutator({
        count: 1,
      });
      expect(store.getState()).toEqual({ count: 1 });
    });
  });
});
