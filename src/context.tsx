import React, { createContext } from 'react';

import { defaultRegistry } from './store';

const { Provider, Consumer } = createContext({
  globalRegistry: defaultRegistry,
  getStore: defaultRegistry.getStore,
});

// Reading context value from owner as suggested by gaearon
// https://github.com/facebook/react/pull/13861#issuecomment-430356644
// plus a fix to make it work with enzyme shallow
const readContext = () => {
  const {
    // React < 16.8
    ReactCurrentOwner: { currentDispatcher } = {} as any,
    // React >= 16.8+
    ReactCurrentDispatcher: { current } = {} as any,
  } = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  const dispatcher = current || currentDispatcher;
  return dispatcher
    ? dispatcher.readContext(Consumer)
    : (Consumer as any)._currentValue;
};

export { Provider, Consumer, readContext };
