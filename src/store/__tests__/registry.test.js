/* eslint-env jest */

import { StoreMock } from '../../__tests__/mocks';
import { StoreRegistry } from '../registry';

describe('StoreRegistry', () => {
  it('should get and create a new store', () => {
    const registry = new StoreRegistry();
    const instance = registry.getStore(StoreMock);
    expect(registry.stores.size).toEqual(1);
    expect(instance).toEqual({
      actions: expect.any(Object),
      storeState: expect.any(Object),
    });
  });

  it('should initialise store with initial state', () => {
    const registry = new StoreRegistry();
    const instance = registry.getStore(StoreMock);
    expect(instance.storeState.getState()).toEqual({ count: 0 });
  });

  it('should get an existing store if no scopeId provided', () => {
    const registry = new StoreRegistry();
    const instance1 = registry.getStore(StoreMock);
    const instance2 = registry.getStore(StoreMock);
    expect(registry.stores.size).toEqual(1);
    expect(instance1).toBe(instance2);
  });

  it('should get an existing store if scopeId matches', () => {
    const registry = new StoreRegistry();
    const instance1 = registry.getStore(StoreMock, 's1');
    const instance2 = registry.getStore(StoreMock, 's1');
    expect(registry.stores.size).toEqual(1);
    expect(instance1).toBe(instance2);
  });

  it('should get and create a new store if different scope', () => {
    const registry = new StoreRegistry();
    const instance1 = registry.getStore(StoreMock);
    const instance2 = registry.getStore(StoreMock, 's1');
    expect(registry.stores.size).toEqual(2);
    expect(instance1).not.toBe(instance2);
  });

  it('should delete store from registry', () => {
    const registry = new StoreRegistry();
    registry.getStore(StoreMock);
    registry.getStore(StoreMock, 's1');
    registry.deleteStore(StoreMock, 's1');
    expect(registry.stores.size).toEqual(1);
  });

  describe('Store keys', () => {
    it('should suffix defaultScope ctor arg for unscoped stores', () => {
      const registry = new StoreRegistry('__local__');
      registry.getStore(StoreMock);
      expect(Array.from(registry.stores.keys())).toEqual([
        'store-key@__local__',
      ]);
    });

    it('should suffix with __global__ for unscoped stores without a defaultScope ctor arg', () => {
      const registry = new StoreRegistry();
      registry.getStore(StoreMock);
      expect(Array.from(registry.stores.keys())).toEqual([
        'store-key@__global__',
      ]);
    });

    it('should suffix with scopeId for scoped stores', () => {
      const registry = new StoreRegistry();
      registry.getStore(StoreMock, 's1');
      expect(Array.from(registry.stores.keys())).toEqual(['store-key@s1']);
    });
  });
});
