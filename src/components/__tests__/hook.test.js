/* eslint-env jest */

import React from 'react';
import { render, act, configure } from '@testing-library/react';

import { StoreMock, storeStateMock } from '../../__tests__/mocks';
import { withStrict } from '../../__tests__/utils';
import { createHook, createActionsHook, createStateHook } from '../hook';
import { defaultRegistry } from '../../store/registry';

jest.mock('../../store/registry', () => {
  const mockRegistry = {
    configure: jest.fn(),
    getStore: jest.fn(),
  };
  return {
    __esModule: true,
    StoreRegistry: jest.fn().mockImplementation(() => mockRegistry),
    defaultRegistry: mockRegistry,
  };
});

describe('Hook', () => {
  const actions = {
    increase: expect.any(Function),
    decrease: expect.any(Function),
  };

  const setup = ({ props = {}, selector, creator = createHook } = {}) => {
    const childrenFn = jest.fn().mockReturnValue(null);
    const useHook = creator(StoreMock, { selector });
    const Subscriber = ({ children, ...p }) => {
      const v = useHook(p);
      return children(v);
    };
    const getElement = (newProps = {}) => (
      <Subscriber {...props} {...newProps}>
        {childrenFn}
      </Subscriber>
    );
    const getRender = () => render(getElement());
    return {
      getElement,
      getRender,
      children: childrenFn,
    };
  };

  beforeEach(() => {
    defaultRegistry.getStore.mockReturnValue({
      storeState: storeStateMock,
      actions: StoreMock.actions,
    });
    jest
      .spyOn(storeStateMock, 'getState')
      .mockReturnValue(StoreMock.initialState);
    jest.spyOn(storeStateMock, 'subscribe');
    configure({ reactStrictMode: true });
  });

  describe('createHook', () => {
    it('should get the storeState from registry', () => {
      const { getRender } = setup();
      getRender();
      expect(defaultRegistry.getStore).toHaveBeenCalledWith(StoreMock);
    });

    it('should render children with store data and actions', () => {
      const { getRender, children } = setup();
      getRender();
      expect(children).toHaveBeenCalledTimes(withStrict(1));
      expect(children).toHaveBeenCalledWith([{ count: 0 }, actions]);
    });

    it('should update when store calls update listener', () => {
      const { getRender, children } = setup();
      storeStateMock.getState.mockReturnValue({ count: 1 });
      getRender();

      expect(storeStateMock.subscribe).toHaveBeenCalled();
      const newState = { count: 2 };
      storeStateMock.getState.mockReturnValue(newState);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      act(() => update(newState));

      expect(children).toHaveBeenCalledTimes(withStrict(2));
      expect(children).toHaveBeenCalledWith([{ count: 1 }, actions]);
      expect(children).toHaveBeenLastCalledWith([{ count: 2 }, actions]);
    });

    it('should avoid re-render children when just rendered from parent update', () => {
      const { getElement, children } = setup();
      const App = () => getElement();

      const { rerender } = render(<App />);
      // simulate store change -> parent re-render -> yield listener update
      const newState = { count: 1 };
      storeStateMock.getState.mockReturnValue(newState);
      rerender(<App foo={1} />);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      act(() => update(newState));

      expect(storeStateMock.getState).toHaveBeenCalled();
      expect(children).toHaveBeenCalledTimes(withStrict(2));
      expect(children).toHaveBeenCalledWith([newState, actions]);
    });

    it('should remove listener from store on unmount', () => {
      const { getRender } = setup();
      const unsubscribeMock = jest.fn();
      storeStateMock.subscribe.mockReturnValue(unsubscribeMock);
      const { unmount } = getRender();
      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should not set state if updated after unmount', () => {
      jest.spyOn(console, 'error');
      const { getRender } = setup();
      storeStateMock.subscribe.mockReturnValue(jest.fn());
      const { unmount } = getRender();
      const newState = { count: 1 };
      storeStateMock.getState.mockReturnValue(newState);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      unmount();
      act(() => update(newState));

      expect(console.error).not.toHaveBeenCalled();
    });

    it('should render children with selected return value', () => {
      const selector = jest.fn().mockReturnValue({ foo: 1 });
      const { getRender, children } = setup({ props: { prop: 1 }, selector });
      getRender();
      expect(selector).toHaveBeenCalledWith(StoreMock.initialState, {
        prop: 1,
      });
      expect(children).toHaveBeenCalledWith([{ foo: 1 }, actions]);
    });

    it('should re-render children with selected return value', () => {
      const selector = jest.fn().mockReturnValue({ foo: 1 });
      const { getRender, children } = setup({ selector });
      getRender();
      const newState = { count: 1 };
      selector.mockReturnValue({ foo: 2 });
      storeStateMock.getState.mockReturnValue(newState);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      act(() => update(newState));
      expect(children).toHaveBeenLastCalledWith([{ foo: 2 }, actions]);
    });

    it('should re-render children with same value if selector output is shallow equal', () => {
      configure({ reactStrictMode: false });

      const selector = () => ({ foo: 1 });
      const { getRender, getElement, children } = setup({
        props: { bar: 1 },
        selector,
      });
      const { rerender } = getRender();
      const newState = { count: 1 };
      storeStateMock.getState.mockReturnValue(newState);

      rerender(getElement({ bar: 1 }));

      // ensure memoisation on selector OUTPUT works
      const [childrenStateInitial] = children.mock.calls[0][0];
      const [childrenStateUpdate] = children.mock.calls[1][0];
      expect(childrenStateInitial).toBe(childrenStateUpdate);
    });

    it('should update on state change if selector output is not shallow equal', () => {
      const selector = jest.fn().mockImplementation(() => ({ foo: [1] }));
      const { getRender, children } = setup({ selector });
      getRender();
      const newState = { count: 1 };
      storeStateMock.getState.mockReturnValue(newState);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      act(() => update(newState));

      expect(children).toHaveBeenCalledTimes(withStrict(2));
    });

    it('should not update on state change if selector output is shallow equal', () => {
      configure({ reactStrictMode: false });

      const selector = jest.fn().mockImplementation(() => ({ foo: 1 }));
      const { getRender, children } = setup({ selector });
      getRender();
      const newState = { count: 1 };
      storeStateMock.getState.mockReturnValue(newState);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      act(() => update(storeStateMock.getState(), storeStateMock));

      expect(children).toHaveBeenCalledTimes(1);
      // ensure that on state change memoisation breaks
      expect(selector).toHaveBeenCalledTimes(2);
    });

    it('should not recompute selector if state & props are equal', () => {
      const selector = jest.fn().mockReturnValue({ foo: 1 });
      const { getRender, getElement } = setup({ props: { bar: 1 }, selector });
      const { rerender } = getRender();
      rerender(getElement({ bar: 1 }));

      // ensure memoisation works
      expect(selector).toHaveBeenCalledTimes(withStrict(1));
    });

    it('should not update on state change if selector is null', () => {
      const selector = null;
      const { getRender, children } = setup({ selector });
      getRender();

      const newState = { count: 1 };
      storeStateMock.getState.mockReturnValue(newState);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      act(() => update(storeStateMock.getState(), storeStateMock));

      expect(children).toHaveBeenCalledTimes(withStrict(1));
      expect(children).toHaveBeenCalledWith([undefined, actions]);
    });

    it('should support selectors returning a function on init and update', () => {
      const selector =
        (state) =>
        ({ id }) =>
          state[id];
      const { getRender, children } = setup({ selector });
      getRender();

      const newState = { count: 1 };
      storeStateMock.getState.mockReturnValue(newState);
      const update = storeStateMock.subscribe.mock.calls[0][0];
      act(() => update(storeStateMock.getState(), storeStateMock));

      expect(children).toHaveBeenCalledWith([expect.any(Function), actions]);
    });
  });

  describe('createActionsHook', () => {
    it('should render children with just actions', () => {
      const { getRender, children } = setup({ creator: createActionsHook });
      getRender();
      expect(children).toHaveBeenCalledTimes(withStrict(1));
      expect(children).toHaveBeenCalledWith(actions);
    });
  });

  describe('createStateHook', () => {
    it('should render children with just store data', () => {
      const { getRender, children } = setup({ creator: createStateHook });
      getRender();
      expect(children).toHaveBeenCalledTimes(withStrict(1));
      expect(children).toHaveBeenCalledWith({ count: 0 });
    });
  });
});
