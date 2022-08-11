const defaultMutator = (prevState, partialState) => {
  // Merge the partial state and the previous state.
  return Object.assign({}, prevState, partialState);
};

const defaults = {
  batchUpdates: false,
  devtools: false,
  middlewares: new Set(),
  mutator: defaultMutator,
};

export default defaults;
