import applyMiddleware from '../middlewares';
import withDevtools from '../enhancers/devtools';
import defaults from '../defaults';

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
      storeState.notify();
    },
    resetState() {
      storeState.setState(initialState);
    },
    notify(s = storeState) {
      for (let listener of listeners) {
        listener(s.getState(), s);
      }
    },
    subscribe(listener) {
      listeners = listeners.concat(listener);
      return function unsubscribe() {
        listeners = listeners.filter(fn => fn !== listener);
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
