import React from 'react';

const defaultMutator = (prevState, partialState) => {
  // Merge the partial state and the previous state.
  return Object.assign({}, prevState, partialState);
};

const defaults = {
  batchUpdates: 'useSyncExternalStore' in React,
  devtools: false,
  middlewares: new Set(),
  mutator: defaultMutator,
  unstable_concurrent: undefined,
};

export default defaults;
