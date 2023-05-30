import React from 'react';

import { defaultRegistry } from './store';

// Provide static calculateChangedBit to opt-out from context updates
// as we use our own subscription model
export const Context = React.createContext(
  {
    globalRegistry: defaultRegistry,
    retrieveStore: (Store, callsiteRetrieve) => {
      const context = {
        props: () => ({}),
        retrieveStore: callsiteRetrieve,
        isContained: () => false,
      };
      return defaultRegistry.getStore(
        Store,
        defaultRegistry.defaultScope,
        context
      );
    },
  },
  () => 0
);
