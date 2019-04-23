import { bindActions } from './bind-actions';
import createStoreState from './create-state';

export const GLOBAL_SCOPE = '__global__';

export class StoreRegistry {
  stores = new Map();
  initialStates = {};

  constructor(defaultScope = GLOBAL_SCOPE) {
    this.defaultScope = defaultScope;
  }

  configure = ({ initialStates = {} }) => {
    this.initialStates = initialStates;
  };

  initStore = (Store, key) => {
    const { initialState, actions } = Store;
    const injectedState = this.initialStates[key];
    const storeState = createStoreState(key, injectedState || initialState);
    const boundActions = bindActions(actions, storeState);
    const store = { storeState, actions: boundActions };

    this.stores.set(key, store);
    return store;
  };

  getStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    return this.stores.get(key) || this.initStore(Store, key);
  };

  deleteStore = (Store, scopeId = this.defaultScope) => {
    const key = this.generateKey(Store, scopeId);
    this.stores.delete(key);
  };

  generateKey = (Store, scopeId) => `${Store.key.join('__')}@${scopeId}`;

  getStates = () => {
    const output = {};
    this.stores.forEach(({ storeState }, key) => {
      output[key] = storeState.getState();
    });
    return output;
  };
}

export const defaultRegistry = new StoreRegistry();
