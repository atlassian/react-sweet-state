import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useDebugValue,
} from 'react';
import { Context } from '../context';
import memoize from '../utils/memoize';
import shallowEqual from '../utils/shallow-equal';

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

    // If selector is not null, create a ref to the memoized version of it
    // Otherwise always return same value, as we ignore state
    const stateSelector = selector
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useCallback(memoize(selector), [])
      : selector === null
      ? EMPTY_SELECTOR
      : DEFAULT_SELECTOR;

    // At every render we get fresh state and using recent propsArg
    // we calculate the current value, to be used immediately
    const currentState = stateSelector(storeState.getState(), propsArg);
    useDebugValue(currentState);

    const [, triggerUpdate] = useState(0);
    const subscriptionRef = useRef(false);

    // We store update function into a ref and re-create on each render
    // so when called gets fresh currentState and props
    const onUpdateRef = useRef();
    onUpdateRef.current = (
      updStoreState = storeState.getState(),
      forceUpdate = false
    ) => {
      // if unsubscribed / unmounted do not set state
      if (!subscriptionRef.current) return;

      const nextState = stateSelector(updStoreState, propsArg);
      if (!shallowEqual(nextState, currentState) || forceUpdate) {
        triggerUpdate(n => ~n);
      }
    };

    // On component mount (or storeState change) we subscribe to storeState updates
    useIsomorphicLayoutEffect(() => {
      // we call the current ref fn so props are fresh
      const onUpdate = (...a) => onUpdateRef.current(...a);
      const unsubscribe = storeState.subscribe(onUpdate);
      subscriptionRef.current = true;
      // trigger a first update as state might have changed in meantime
      onUpdate();
      return () => {
        unsubscribe();
        subscriptionRef.current = false;
      };
    }, [storeState]);

    return [currentState, actions];
  };
}
