import { useMemo, useContext, useRef, useCallback, useState } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import { Context } from '../context';
import { getSelectorInstance } from '../utils/create-selector';

const EMPTY_SELECTOR = () => undefined;
const DEFAULT_SELECTOR = (state) => state;

export function createHook(Store, { selector } = {}) {
  return function useSweetState(propsArg) {
    const { retrieveStore } = useContext(Context);
    const { storeState, actions } = retrieveStore(Store);

    const hasPropsArg = propsArg !== undefined;
    const propsArgRef = useRef(propsArg);
    propsArgRef.current = propsArg;

    const stateSelector = useMemo(
      () =>
        selector
          ? getSelectorInstance(selector, storeState, hasPropsArg)
          : selector === null
            ? EMPTY_SELECTOR
            : DEFAULT_SELECTOR,
      [hasPropsArg, storeState]
    );

    const forceUpdate = useState({})[1];
    const getSnapshot = useCallback(() => {
      // parent scope has changed and notify was explicitly triggered by the container
      // we need to force the hook to re-render to listen new storeState
      if (retrieveStore(Store).storeState !== storeState) forceUpdate({});

      const state = storeState.getState();
      return stateSelector(state, propsArgRef.current);
    }, [retrieveStore, storeState, stateSelector, forceUpdate]);

    const currentState = useSyncExternalStore(
      storeState.subscribe,
      getSnapshot,
      getSnapshot
    );

    return [currentState, actions];
  };
}

export function createActionsHook(Store) {
  const useHook = createHook(Store, { selector: null });
  return function useSweetStateActions() {
    return useHook()[1];
  };
}

export function createStateHook(Store, { selector } = {}) {
  const useHook = createHook(Store, { selector });
  return function useSweetStateState(propsArg) {
    return useHook(propsArg)[0];
  };
}
