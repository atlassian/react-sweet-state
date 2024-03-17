import applyMiddleware from '../middlewares';
import withDevtools from '../enhancers/devtools';
import defaults from '../defaults';
import schedule from '../utils/schedule';

function createStoreState(key, initialState, unstable_concurrent) {
  let listeners = new Set();
  let currentState = initialState;
  const storeState = {
    key,
    getState() {
      return currentState;
    },
    setState(nextState) {
      currentState = nextState;
      if (defaults.unstable_concurrent && unstable_concurrent !== false) {
        if (typeof defaults.unstable_concurrent === 'function') {
          defaults.unstable_concurrent(storeState.notify);
        } else {
          storeState.notify();
        }
      } else {
        // Instead of notifying all handlers immediately, we wait next tick
        // so multiple actions affecting the same store gets combined
        schedule(storeState.notify);
      }
    },
    resetState() {
      storeState.setState(initialState);
    },
    notify() {
      for (const listener of listeners) {
        listener(storeState.getState());
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return function unsubscribe() {
        listeners.delete(listener);
      };
    },
    listeners() {
      return listeners;
    },
  };
  storeState.mutator = applyMiddleware(storeState, defaults.middlewares);
  return storeState;
}

export default withDevtools(createStoreState);
