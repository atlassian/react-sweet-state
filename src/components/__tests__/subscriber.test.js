/* eslint-env jest */

import React from 'react';
import { render } from '@testing-library/react';

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
  const getElement = (newProps = {}) => (
    <Subscriber {...props} {...newProps}>
      {children}
    </Subscriber>
  );
  const getRender = () => render(getElement());
  return { getElement, getRender, children };
};

describe('Subscriber', () => {
  beforeEach(() => {
    defaultRegistry.getStore.mockReturnValue({
      storeState: storeStateMock,
      actions: StoreMock.actions,
    });
    jest
      .spyOn(storeStateMock, 'getState')
      .mockReturnValue(StoreMock.initialState);
  });

  it('should render children with store data and actions', () => {
    const Subscriber = createSubscriber(StoreMock);
    const { getRender, children } = setup(Subscriber);
    getRender();

    expect(children).toHaveBeenCalledTimes(1);
    expect(children).toHaveBeenCalledWith({ count: 0 }, StoreMock.actions);
  });

  it('should render children with selected return value', () => {
    const selector = jest.fn().mockReturnValue({ foo: 1 });
    const Subscriber = createSubscriber(StoreMock, { selector });

    const { getRender, children } = setup(Subscriber, { prop: 1 });
    getRender();

    expect(selector).toHaveBeenCalledWith(StoreMock.initialState, {
      prop: 1,
    });
    expect(children).toHaveBeenCalledWith({ foo: 1 }, StoreMock.actions);
  });

  it('should not recompute selector if state & props are equal', () => {
    const selector = jest.fn().mockReturnValue({ foo: 1 });
    const Subscriber = createSubscriber(StoreMock, { selector });

    const { getElement, children } = setup(Subscriber);
    const App = () => getElement();
    const { rerender } = render(<App />);
    rerender(<App foo={1} />);

    expect(children).toHaveBeenCalledTimes(2);
    // ensure memoisation works
    expect(selector).toHaveBeenCalledTimes(1);
  });
});
