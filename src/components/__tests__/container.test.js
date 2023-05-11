/* eslint-env jest */

import React from 'react';
import { render } from '@testing-library/react';

import { StoreMock, storeStateMock } from '../../__tests__/mocks';
import { defaultRegistry, StoreRegistry } from '../../store/registry';
import { createStore } from '../../store';
import { createContainer } from '../container';
import { createSubscriber } from '../subscriber';

const mockLocalRegistry = {
  configure: jest.fn(),
  getStore: jest.fn(),
  hasStore: jest.fn(),
  deleteStore: jest.fn(),
};

jest.mock('../../store/registry', () => ({
  __esModule: true,
  StoreRegistry: jest.fn(),
  defaultRegistry: {
    configure: jest.fn(),
    getStore: jest.fn(),
    hasStore: jest.fn(),
    deleteStore: jest.fn(),
  },
}));

const mockOnContainerInitInner = jest.fn();
const mockOnContainerUpdateInner = jest.fn();
const mockOnContainerUpdate = jest.fn();
const mockOnContainerCleanupInner = jest.fn();
const Store = createStore({
  name: 'test',
  initialState: StoreMock.initialState,
  actions: StoreMock.actions,
});
const Container = createContainer(Store, {
  onInit: () => mockOnContainerInitInner,
  onUpdate: mockOnContainerUpdate,
  onCleanup: () => mockOnContainerCleanupInner,
});

describe('Container', () => {
  beforeEach(() => {
    const getStoreReturn = {
      storeState: storeStateMock,
      actions: StoreMock.actions,
    };
    defaultRegistry.getStore.mockReturnValue(getStoreReturn);
    StoreRegistry.mockImplementation(() => mockLocalRegistry);
    mockLocalRegistry.getStore.mockReturnValue(getStoreReturn);
    jest
      .spyOn(storeStateMock, 'getState')
      .mockReturnValue(StoreMock.initialState);
    mockOnContainerUpdate.mockReturnValue(mockOnContainerUpdateInner);
  });

  describe('createContainer', () => {
    it('should return a Container component', () => {
      expect(Container.displayName).toEqual('Container(test)');
      expect(Container.storeType).toEqual(Store);
      expect(Container.hooks).toEqual({
        onInit: expect.any(Function),
        onUpdate: expect.any(Function),
        onCleanup: expect.any(Function),
      });
    });
  });

  describe('constructor', () => {
    it('should create local store registry', () => {
      expect(StoreRegistry).not.toHaveBeenCalled();
      render(
        <Container>
          <div />
        </Container>
      );

      expect(StoreRegistry).toHaveBeenCalledWith('__local__');
    });
  });

  describe('integration', () => {
    it('should get storeState from global with scope id if matching', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      render(<Container scope="s1">{children}</Container>);

      expect(defaultRegistry.getStore).toHaveBeenCalledWith(Store, 's1');
      expect(mockLocalRegistry.getStore).not.toHaveBeenCalled();
    });

    it('should get closer storeState with scope id if matching', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const OtherStore = createStore({
        initialState: {},
        actions: {},
      });
      const OtherContainer = createContainer(OtherStore);
      render(
        <Container scope="s1">
          <Container scope="s2">
            <OtherContainer scope="s3">
              <OtherContainer>{children}</OtherContainer>
            </OtherContainer>
          </Container>
        </Container>
      );

      expect(defaultRegistry.getStore).toHaveBeenCalledWith(Store, 's2');
    });

    it('should get local storeState if local matching', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      render(<Container>{children}</Container>);

      expect(mockLocalRegistry.getStore).toHaveBeenCalledWith(Store, undefined);
      expect(defaultRegistry.getStore).not.toHaveBeenCalled();
    });

    it('should get storeState from global registry when isGlobal is set', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      render(<Container isGlobal>{children}</Container>);

      expect(defaultRegistry.getStore).toHaveBeenCalledWith(Store, undefined);
      expect(mockLocalRegistry.getStore).not.toHaveBeenCalled();
    });

    it('should cleanup from global on unmount if no more listeners', async () => {
      const listeners = [];
      const subscribe = (fn) => {
        listeners.push(fn);
        return () => (listeners.length = 0);
      };
      jest.spyOn(storeStateMock, 'subscribe').mockImplementation(subscribe);
      jest.spyOn(storeStateMock, 'listeners').mockReturnValue(listeners);
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const { unmount } = render(<Container scope="s1">{children}</Container>);
      unmount();
      await Promise.resolve();

      expect(listeners).toHaveLength(0);
      expect(defaultRegistry.deleteStore).toHaveBeenCalledWith(Store, 's1');
    });

    it('should call Container onCleanup on unmount', async () => {
      const listeners = [];
      const subscribe = (fn) => {
        listeners.push(fn);
        return () => (listeners.length = 0);
      };
      jest.spyOn(storeStateMock, 'subscribe').mockImplementation(subscribe);
      jest.spyOn(storeStateMock, 'listeners').mockReturnValue(listeners);
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const { unmount } = render(<Container>{children}</Container>);
      unmount();
      await Promise.resolve();

      expect(listeners).toHaveLength(0);
      expect(mockOnContainerCleanupInner).toHaveBeenCalledTimes(1);
    });

    it('should not cleanup from global on unmount if still listeners', async () => {
      jest.spyOn(storeStateMock, 'listeners').mockReturnValue([jest.fn()]);
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const { unmount } = render(<Container scope="s1">{children}</Container>);
      unmount();
      await Promise.resolve();

      expect(defaultRegistry.deleteStore).not.toHaveBeenCalled();
    });

    it('should cleanup from global on id change if no more listeners', async () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const { rerender } = render(<Container scope="s1">{children}</Container>);
      rerender(<Container scope="s2">{children}</Container>);
      await Promise.resolve();

      expect(defaultRegistry.deleteStore).toHaveBeenCalledWith(Store, 's1');
    });

    it('should not cleanup from global on unmount if not scoped', async () => {
      jest.spyOn(storeStateMock, 'listeners').mockReturnValue([]);
      const { unmount } = render(<Container isGlobal>Content</Container>);
      unmount();
      await Promise.resolve();

      expect(defaultRegistry.deleteStore).not.toHaveBeenCalled();
    });

    it('should not cleanup from global if same type gets recreated meanwhile', async () => {
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      const { unmount } = render(<Container scope="s1">{children}</Container>);
      unmount();

      // given cleanup is scheduled, we fake the eventuality that the store gets replaced in meantime
      defaultRegistry.getStore.mockReturnValue({
        storeState: { ...storeStateMock },
        actions: StoreMock.actions,
      });
      await Promise.resolve();

      expect(defaultRegistry.deleteStore).not.toHaveBeenCalled();
    });

    it('should call Container onInit on first render', () => {
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      render(<Container defaultCount={5}>{children}</Container>);
      // silence console warn on actions getter
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(mockOnContainerInitInner).toHaveBeenCalledWith(
        {
          getState: expect.any(Function),
          setState: expect.any(Function),
          actions: expect.any(Object),
          dispatch: expect.any(Function),
        },
        { defaultCount: 5 }
      );

      expect(mockOnContainerInitInner).toHaveBeenCalledTimes(1);
      expect(mockOnContainerUpdateInner).not.toHaveBeenCalled();
    });

    it('should call Container onUpdate on re-render if props changed', () => {
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      const { rerender } = render(
        <Container defaultCount={5}>{children}</Container>
      );
      rerender(<Container defaultCount={6}>{children}</Container>);

      expect(mockOnContainerInitInner).toHaveBeenCalledTimes(1);
      expect(mockOnContainerUpdate).toHaveBeenCalled();
      // silence console warn on actions getter
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(mockOnContainerUpdateInner).toHaveBeenCalledWith(
        {
          getState: expect.any(Function),
          setState: expect.any(Function),
          actions: expect.any(Object),
          dispatch: expect.any(Function),
        },
        { defaultCount: 6 }
      );
    });

    it('should pass props to subscriber actions', () => {
      const actionInner = jest.fn();
      StoreMock.actions.increase.mockReturnValue(actionInner);
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      render(<Container defaultCount={5}>{children}</Container>);
      const [, { increase }] = renderPropChildren.mock.calls[0];
      increase();

      expect(actionInner).toHaveBeenCalledWith(expect.any(Object), {
        defaultCount: 5,
      });
    });

    it('should pass fresh props to subscriber actions when they change', () => {
      const actionInner = jest.fn();
      StoreMock.actions.increase.mockReturnValue(actionInner);
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      const { rerender } = render(
        <Container defaultCount={5}>{children}</Container>
      );
      const [, { increase }] = renderPropChildren.mock.calls[0];
      rerender(<Container defaultCount={6}>{children}</Container>);
      increase();

      expect(actionInner).toHaveBeenCalledWith(expect.any(Object), {
        defaultCount: 6,
      });
    });
  });
});
