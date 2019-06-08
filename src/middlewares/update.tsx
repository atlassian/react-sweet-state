const updateMiddleware = storeState => next => arg => {
  let output;
  const state = storeState.getState();
  const nextState = next(state, arg, out => {
    output = out;
  });
  if (nextState !== state) {
    storeState.setState(nextState);
  }
  return output;
};

export default updateMiddleware;
