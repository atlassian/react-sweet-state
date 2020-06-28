import { createHook } from './hook';

export function createSubscriber(Store, { selector, displayName = '' } = {}) {
  const useStore = createHook(Store, { selector });
  const Subscriber = function({ children, ...rest }) {
    const [state, actions] = useStore(rest);
    return children(state, actions);
  };
  Subscriber.displayName = displayName || `Subscriber(${Store.key[0]})`;
  return Subscriber;
}
