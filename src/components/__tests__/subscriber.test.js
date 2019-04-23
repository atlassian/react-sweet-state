/* eslint-env jest */

import React, { Component } from 'react';
import { mount } from 'enzyme';

import { StoreMock, storeStateMock } from '../../__tests__/mocks';
import SubscriberComponent from '../subscriber';
import { defaultRegistry } from '../../store/registry';

jest.mock('../../store/registry', () => {
  const mockRegistry = {
    configure: jest.fn(),
    getStore: jest.fn(),
  };
  return {
    __esModule: true,
    StoreRegistry: () => mockRegistry,
    defaultRegistry: mockRegistry,
  };
});

let Subscriber;

const actions = {
  increase: expect.any(Function),
  decrease: expect.any(Function),
};

const setup = (props = {}) => {
  const children = jest.fn().mockReturnValue(null);
  const getElement = () => <Subscriber {...props}>{children}</Subscriber>;
  const getMount = () => {
    const component = mount(getElement());
    return { component, instance: component.instance() };
  };
  return {
    getElement,
    getMount,
    children,
  };
};

describe('Subscriber', () => {
  beforeEach(() => {
    Subscriber = class extends SubscriberComponent {};
    Subscriber.storeType = StoreMock;
    defaultRegistry.getStore.mockReturnValue({
      storeState: storeStateMock,
      actions: StoreMock.actions,
    });
    storeStateMock.getState.mockReturnValue(StoreMock.initialState);
  });

  it('should get the store instance from registry', () => {
    const { getMount } = setup();
    getMount();
    expect(defaultRegistry.getStore).toHaveBeenCalledWith(StoreMock);
  });

  it('should save store instance locally and listen', () => {
    const { getMount } = setup();
    const { instance } = getMount();
    expect(instance.store).toEqual({
      storeState: storeStateMock,
      actions: expect.any(Object),
    });
    expect(storeStateMock.subscribe).toHaveBeenCalledWith(instance.onUpdate);
  });

  it('should render children with store data and actions', () => {
    const { getMount, children } = setup();
    getMount();
    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith({ count: 0 }, actions);
  });

  it('should update on mount if store value changes in meantime', () => {
    const { getMount, children } = setup();
    storeStateMock.getState.mockReturnValueOnce({ count: 1 });
    storeStateMock.getState.mockReturnValue({ count: 2 });
    getMount();
    expect(children).toHaveBeenCalledTimes(2);
    expect(children).toHaveBeenCalledWith({ count: 1 }, actions);
    expect(children).toHaveBeenLastCalledWith({ count: 2 }, actions);
  });

  it('should update when store calls update listener', () => {
    const { getMount, children } = setup();
    storeStateMock.getState.mockReturnValue({ count: 1 });
    const { instance } = getMount();
    storeStateMock.getState.mockReturnValue({ count: 2 });
    instance.onUpdate();
    expect(children).toHaveBeenCalledTimes(2);
    expect(children).toHaveBeenCalledWith({ count: 1 }, actions);
    expect(children).toHaveBeenLastCalledWith({ count: 2 }, actions);
  });

  it('should avoid re-render children when just rendered from parent update', () => {
    const { getElement, children } = setup();
    class App extends Component {
      render() {
        return getElement();
      }
    }
    const wrapper = mount(<App />);
    // simulate store change -> parent re-render -> yield listener update
    storeStateMock.getState.mockReturnValue({ count: 1 });
    wrapper.setProps({ foo: 1 });
    wrapper
      .find(Subscriber)
      .instance()
      .onUpdate();

    expect(storeStateMock.getState).toHaveBeenCalledTimes(4);
    expect(children).toHaveBeenCalledTimes(2);
    expect(children).toHaveBeenCalledWith({ count: 1 }, actions);
  });

  it('should remove listener from store on unmount', () => {
    const { getMount } = setup();
    const unsubscribeMock = jest.fn();
    storeStateMock.subscribe.mockReturnValue(unsubscribeMock);
    const { instance } = getMount();
    expect(instance.subscription).toEqual({
      storeState: instance.store.storeState,
      remove: unsubscribeMock,
    });
    instance.componentWillUnmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('should render children with selected return value', () => {
    Subscriber.selector = jest.fn().mockReturnValue({ foo: 1 });
    const { getMount, children } = setup({ prop: 1 });
    getMount();
    expect(Subscriber.selector).toHaveBeenCalledWith(StoreMock.initialState, {
      prop: 1,
    });
    expect(children).toHaveBeenCalledWith({ foo: 1 }, actions);
    Subscriber.selector = undefined;
  });

  it('should re-render children with selected return value', () => {
    Subscriber.selector = jest.fn().mockReturnValue({ foo: 1 });
    const { getMount, children } = setup();
    const { instance } = getMount();
    Subscriber.selector.mockReturnValue({ foo: 2 });
    storeStateMock.getState.mockReturnValue({ count: 1 });
    instance.onUpdate();
    expect(children).toHaveBeenLastCalledWith({ foo: 2 }, actions);
    Subscriber.selector = undefined;
  });

  it('should update on state change if selector output is not shallow equal', () => {
    Subscriber.selector = jest.fn().mockImplementation(() => ({ foo: [1] }));
    const { getMount, children } = setup();
    const { instance } = getMount();
    storeStateMock.getState.mockReturnValue({ count: 1 });
    instance.onUpdate();
    expect(children).toHaveBeenCalledTimes(2);
    Subscriber.selector = undefined;
  });

  it('should not update on state change if selector output is shallow equal', () => {
    Subscriber.selector = jest.fn().mockImplementation(() => ({ foo: 1 }));
    const { getMount, children } = setup();
    const { instance } = getMount();
    storeStateMock.getState.mockReturnValue({ count: 1 });
    instance.onUpdate();
    expect(children).toHaveBeenCalledTimes(1);
    // ensure that on state change memoisation breaks
    expect(Subscriber.selector).toHaveBeenCalledTimes(2);
    Subscriber.selector = undefined;
  });

  it('should not recompute selector if state & props are equal', () => {
    Subscriber.selector = jest.fn().mockReturnValue({ foo: 1 });
    const { getElement, children } = setup();
    class App extends Component {
      render() {
        return getElement();
      }
    }
    const wrapper = mount(<App />);
    wrapper.setProps({ foo: 1 });
    expect(children).toHaveBeenCalledTimes(2);

    // ensure memoisation works
    expect(Subscriber.selector).toHaveBeenCalledTimes(1);
    Subscriber.selector = undefined;
  });

  it('should not update on state change if selector is null', () => {
    Subscriber.selector = null;
    const { getMount, children } = setup();
    const { instance } = getMount();
    storeStateMock.getState.mockReturnValue({ count: 1 });
    instance.onUpdate();
    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith(undefined, actions);
    Subscriber.selector = undefined;
  });
});
