import React from 'react';

const defaultMutator = (prevState, partialState) => {
  // Merge the partial state and the previous state.
  return Object.assign({}, prevState, partialState);
};

let batchUpdates;

const defaults = {
  devtools: false,
  set batchUpdates(v) {
    if (batchUpdates == null && React.useSyncExternalStore !== undefined)
      console.warn(
        `react-sweet-state 'defaults.batchUpdates' setting has been deprecated and is not recommended with React 18.`
      );
    batchUpdates = v;
  },
  get batchUpdates() {
    return batchUpdates;
  },
  middlewares: new Set(),
  mutator: defaultMutator,
};

export default defaults;
