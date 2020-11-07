const defaultMutator = (prevState, partialState) => {
  // Merge the partial state and the previous state.
  return Object.assign({}, prevState, partialState);
};

let middlewares;

const defaults = {
  devtools: false,
  batchUpdates: false,
  get middlewares() {
    // lazy init to support IE11 + babel polyfill imported after
    if (!middlewares) middlewares = new Set();
    return middlewares;
  },
  mutator: defaultMutator,
};

export default defaults;
