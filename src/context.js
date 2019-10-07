import React from 'react';

import { defaultRegistry } from './store';

// Provide static calculateChangedBit to opt-out from context updates
// as we use our own subscription model
export const Context = React.createContext(
  {
    globalRegistry: defaultRegistry,
    getStore: defaultRegistry.getStore,
  },
  () => 0
);
