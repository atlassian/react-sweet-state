import ContainerComponent from './container';
import SubscriberComponent from './subscriber';

const noop = () => () => {};
const defaultSelector = state => state;

export function createSubscriber(
  Store,
  { selector = defaultSelector, displayName = '' } = {}
) {
  return class extends SubscriberComponent {
    static storeType = Store;
    static displayName = displayName || `Subscriber(${Store.key[0]})`;
    static selector = selector;
  };
}

export function createContainer(
  Store,
  { onInit = noop, onUpdate = noop, displayName = '' } = {}
) {
  return class extends ContainerComponent {
    static storeType = Store;
    static displayName = displayName || `Container(${Store.key[0]})`;
    static hooks = { onInit, onUpdate };
  };
}
