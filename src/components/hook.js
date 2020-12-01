import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useDebugValue,
} from 'react';
import { Context } from '../context';
import { getSelectorInstance } from '../utils/create-selector';

const EMPTY_SELECTOR = () => undefined;
const DEFAULT_SELECTOR = state => state;

// As we want to subscribe ASAP and useEffect happens on next tick, but
// React currently throws a warning when using useLayoutEffect on the server
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function createHook(Store, { selector } = {}) {
  return function useSweetState(propsArg) {
    const { getStore } = useContext(Context);
    const { storeState, actions } = getStore(Store);
    const hasPropsArg = propsArg !== undefined;

    // If selector is not null, create a ref to the memoized version of it
    // Otherwise always return same value, as we ignore state
    const stateSelector = selector
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useMemo(() => getSelectorInstance(selector, storeState, hasPropsArg), [
          hasPropsArg,
          storeState,
        ])
      : selector === null
      ? EMPTY_SELECTOR
      : DEFAULT_SELECTOR;

    // At every render we get fresh state and using recent propsArg
    // we calculate the current value, to be used immediately
    const currentState = stateSelector(storeState.getState(), propsArg);
    useDebugValue(currentState);

    const triggerUpdate = useState(() => currentState)[1];
    const propsRef = useRef(propsArg);
    propsRef.current = propsArg;

    useIsomorphicLayoutEffect(() => {
      let subscription = {};
      let prevState;
      const onUpdate = (updatedState, updatedStoreState) => {
        // if already unmounted ignore the update
        if (!subscription) return;
        // if scope changed, force a re-render to trigger new subscription
        if (updatedStoreState !== storeState) return triggerUpdate({});
        // if selector null we bail out from normal state updates
        if (stateSelector === EMPTY_SELECTOR) return;
        const nextState = stateSelector(updatedState, propsRef.current);

        if (nextState !== prevState) {
          triggerUpdate(() => nextState);
          prevState = nextState;
        }
      };

      subscription.unsubscribe = storeState.subscribe(onUpdate);

      // Because we're subscribing in a passive effect,
      // it's possible that an update has occurred between render and effect
      onUpdate(storeState.getState(), storeState);

      return () => {
        // On component unmount we unsubscribe to storeState updates
        subscription.unsubscribe();
        subscription = null;
      };
    }, [storeState]);

    return [currentState, actions];
  };
}
