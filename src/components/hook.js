import { useMemo, useContext, useRef, useCallback } from 'react';
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

    const getSnapshot = useCallback(() => {
      const state = retrieveStore(Store).storeState.getState();
      return stateSelector(state, propsArgRef.current);
    }, [retrieveStore, stateSelector]);

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
