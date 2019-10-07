import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
  useContext,
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
const useUnmount = fn => useIsomorphicLayoutEffect(() => fn, []);

const handleStoreSubscription = (subscriptionRef, onUpdateRef, storeState) => {
  if (subscriptionRef.current) {
    subscriptionRef.current.remove();
    subscriptionRef.current = null;
  }
  if (storeState && onUpdateRef) {
    // we call the current ref fn so props are fresh
    const onUpdate = (...args) => onUpdateRef.current(...args);
    subscriptionRef.current = {
      storeState,
      remove: storeState.subscribe(onUpdate),
    };
  }
};

export function createHook(Store, { selector } = {}) {
  return function(props) {
    const { getStore } = useContext(Context);
    const { storeState, actions } = getStore(Store);

    // If selector is not null, create a ref to the memoized version of it
    // Otherwise always return same value, as we ignore state
    const stateSelector = selector
      ? useCallback(memoize(selector), [])
      : selector === null
      ? EMPTY_SELECTOR
      : DEFAULT_SELECTOR;

    const currentState = stateSelector(storeState.getState(), props);
    const [prevState, setState] = useState(currentState);
    const subscriptionRef = useRef();

    // We store update function into a ref so when called has fresh props
    const onUpdateRef = useRef();
    onUpdateRef.current = (updState = prevState, forceUpdate = false) => {
      // if we already unmounted the component do not set state
      if (!subscriptionRef.current) return;

      const nextState = stateSelector(updState, props);
      if (!shallowEqual(nextState, currentState) || forceUpdate) {
        setState(nextState);
      }
    };

    // if we detect that state has changed, we shedule an immediate re-render
    // (as suggested by react docs https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops)
    // In v16.9 this "breaks" concurrent mode, however it is a big perf win
    // as we can update children in a single render pass (if not blocked)
    // instead of waiting for the listener to be called
    if (prevState !== currentState) {
      setState(currentState);
    }

    // on first render or on scope change we subscribe
    // we do it sync, NOT in useEffect, as subscription order is paramount
    // to ensure currect re-render order, top down
    if (
      !subscriptionRef.current ||
      subscriptionRef.current.storeState !== storeState
    ) {
      handleStoreSubscription(subscriptionRef, onUpdateRef, storeState);
    }

    useUnmount(() => handleStoreSubscription(subscriptionRef));

    return [currentState, actions];
  };
}
