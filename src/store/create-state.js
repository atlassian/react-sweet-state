import applyMiddleware from '../middlewares';
import withDevtools from '../enhancers/devtools';
import defaults from '../defaults';
import schedule from '../utils/schedule';

function createStoreState(key, initialState) {
  let listeners = [];
  let currentState = initialState;
  const storeState = {
    key,
    getState() {
      return currentState;
    },
    setState(nextState) {
      currentState = nextState;
      // Instead of notifying all handlers immediately, we wait next tick
      // so multiple actions affecting the same store gets combined
      schedule(storeState.notify);
    },
    resetState() {
      storeState.setState(initialState);
    },
    notify() {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i](storeState.getState());
      }
    },
    subscribe(listener) {
      listeners = listeners.concat(listener);
      return function unsubscribe() {
        listeners = listeners.filter((fn) => fn !== listener);
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
