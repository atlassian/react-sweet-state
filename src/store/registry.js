import { bindActions } from './bind-actions';
import createStoreState from './create-state';

export const GLOBAL_SCOPE = '__global__';

export class StoreRegistry {
  stores = new Map();

  constructor(defaultScope = GLOBAL_SCOPE) {
    this.defaultScope = defaultScope;
  }

  initStore = (key, Store) => {
    const { initialState, actions } = Store;
    const storeState = createStoreState(key, initialState);
    const boundActions = bindActions(actions, storeState);
    const store = { storeState, actions: boundActions };

    this.stores.set(key, store);
    return store;
  };

  getStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    return this.stores.get(key) || this.initStore(key, Store);
  };

  deleteStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    this.stores.delete(key);
  };

  generateKey = (Store, scopeId) => `${Store.key}@${scopeId}`;
}

export const defaultRegistry = new StoreRegistry();
