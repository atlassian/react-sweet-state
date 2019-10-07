/* eslint-env jest */

import React, { Component } from 'react';
import { mount } from 'enzyme';

import { StoreMock, storeStateMock } from '../../__tests__/mocks';
import { createSubscriber } from '../subscriber';
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

const setup = (Subscriber, props = {}) => {
  const children = jest.fn().mockReturnValue(null);
  const getElement = () => <Subscriber {...props}>{children}</Subscriber>;
  const getMount = () => {
    const component = mount(getElement());
    return { component, instance: component.instance() };
  };
  return { getElement, getMount, children };
};

describe('Subscriber', () => {
  beforeEach(() => {
    defaultRegistry.getStore.mockReturnValue({
      storeState: storeStateMock,
      actions: StoreMock.actions,
    });
    storeStateMock.getState.mockReturnValue(StoreMock.initialState);
  });

  it('should render children with store data and actions', () => {
    const Subscriber = createSubscriber(StoreMock);
    const { getMount, children } = setup(Subscriber);
    getMount();
    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith({ count: 0 }, StoreMock.actions);
  });

  it('should render children with selected return value', () => {
    const selector = jest.fn().mockReturnValue({ foo: 1 });
    const Subscriber = createSubscriber(StoreMock, { selector });

    const { getMount, children } = setup(Subscriber, { prop: 1 });
    getMount();
    expect(selector).toHaveBeenCalledWith(StoreMock.initialState, {
      prop: 1,
    });
    expect(children).toHaveBeenCalledWith({ foo: 1 }, StoreMock.actions);
  });

  it('should not recompute selector if state & props are equal', () => {
    const selector = jest.fn().mockReturnValue({ foo: 1 });
    const Subscriber = createSubscriber(StoreMock, { selector });

    const { getElement, children } = setup(Subscriber);
    class App extends Component {
      render() {
        return getElement();
      }
    }
    const wrapper = mount(<App />);
    wrapper.setProps({ foo: 1 });
    expect(children).toHaveBeenCalledTimes(2);

    // ensure memoisation works
    expect(selector).toHaveBeenCalledTimes(1);
  });
});
