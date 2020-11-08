import { createHook } from './hook';

function hasAdditionalProps(props) {
  for (let i in props) return true;
  return false;
}

export function createSubscriber(Store, { selector, displayName = '' } = {}) {
  const useStore = createHook(Store, { selector });
  const Subscriber = function({ children, ...rest }) {
    const [state, actions] = useStore(
      hasAdditionalProps(rest) ? rest : undefined
    );
    return children(state, actions);
  };
  Subscriber.displayName = displayName || `Subscriber(${Store.key[0]})`;
  return Subscriber;
}
