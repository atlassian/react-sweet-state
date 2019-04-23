const defaultMutator = (prevState, partialState) => {
  // Merge the partial state and the previous state.
  return Object.assign({}, prevState, partialState);
};

export default {
  devtools: false,
  middlewares: new Set(),
  mutator: defaultMutator,
};
