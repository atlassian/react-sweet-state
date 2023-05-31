import supports from '../utils/supported-features';
import { bindActions } from './bind-actions';
import createStoreState from './create-state';

export const GLOBAL_SCOPE = '__global__';

export class StoreRegistry {
  stores = new Map();

  constructor(defaultScope = GLOBAL_SCOPE) {
    this.defaultScope = defaultScope;
  }

  initStore = (key, Store, config) => {
    const { initialState, actions } = Store;

    if (Store.containedBy && !config.contained(Store)) {
      const err = new Error(
        `Store ${Store.key} should be contained by a container but it is used globally. ` +
          `While it might still work, it will likely cause unexpected behaviours.`
      );
      if (supports.scheduling()) Promise.reject(err);
      else throw err;
    }

    const storeState = createStoreState(key, initialState);
    let boundActions;
    const store = {
      storeState,
      // these are used only when container-less, so we generate them on-demand
      get actions() {
        if (!boundActions)
          boundActions = bindActions(actions, storeState, config);
        return boundActions;
      },
    };

    this.stores.set(key, store);
    return store;
  };

  hasStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    return this.stores.has(key);
  };

  getStore = (
    Store,
    scopeId = this.defaultScope,
    config = { props: () => ({}), contained: () => false }
  ) => {
    const key = this.generateKey(Store, scopeId);
    return (
      this.stores.get(key) || (config && this.initStore(key, Store, config))
    );
  };

  deleteStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    this.stores.delete(key);
  };

  generateKey = (Store, scopeId) => `${Store.key}@${scopeId}`;
}

export const defaultRegistry = new StoreRegistry();
