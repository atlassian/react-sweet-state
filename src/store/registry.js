import { bindActions } from './bind-actions';
import createStoreState from './create-state';

export const GLOBAL_SCOPE = '__global__';

export class StoreRegistry {
  stores = new Map();

  constructor(defaultScope = GLOBAL_SCOPE) {
    this.defaultScope = defaultScope;
  }

  initStore = (key, Store, fromContainer) => {
    const { initialState, actions } = Store;

    if (Store.containedBy && !fromContainer) {
      Promise.reject(
        new Error(
          `Store ${Store.key} should be contained by a container but it is used globally. ` +
            `While it might still work, it will likely cause unexpected behaviours.`
        )
      );
    }

    const storeState = createStoreState(key, initialState);
    const boundActions = bindActions(actions, storeState);
    const store = { storeState, actions: boundActions };

    this.stores.set(key, store);
    return store;
  };

  hasStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    return this.stores.has(key);
  };

  getStore = (Store, scopeId = this.defaultScope, fromContainer = false) => {
    const key = this.generateKey(Store, scopeId);
    return this.stores.get(key) || this.initStore(key, Store, fromContainer);
  };

  deleteStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    this.stores.delete(key);
  };

  generateKey = (Store, scopeId) => `${Store.key}@${scopeId}`;
}

export const defaultRegistry = new StoreRegistry();
