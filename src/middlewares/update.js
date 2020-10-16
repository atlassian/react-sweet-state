import shallowEqual from '../utils/shallow-equal';

const updateMiddleware = storeState => next => arg => {
  let output;
  const state = storeState.getState();
  const nextState = next(state, arg, out => {
    output = out;
  });
  if (!shallowEqual(nextState, state)) {
    storeState.setState(nextState);
  }
  return output;
};

export default updateMiddleware;
