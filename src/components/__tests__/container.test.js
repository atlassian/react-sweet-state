/* eslint-env jest */

import React from 'react';
import { render, act } from '@testing-library/react';

import { StoreMock } from '../../__tests__/mocks';
import { defaultRegistry } from '../../store/registry';
import { createStore } from '../../store';
import { createContainer } from '../container';
import { createSubscriber } from '../subscriber';

const actTick = () => act(() => Promise.resolve());

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
    defaultRegistry.stores.clear();

    jest.spyOn(defaultRegistry, 'getStore');
    jest.spyOn(defaultRegistry, 'initStore');
    mockOnContainerUpdate.mockReturnValue(mockOnContainerUpdateInner);
  });

  describe('createContainer', () => {
    it('should return a Container component', () => {
      expect(Container.displayName).toEqual('Container(test)');
    });
  });

  describe('constructor', () => {
    it('should create local store registry', () => {
      render(
        <Container>
          <div />
        </Container>
      );

      expect(defaultRegistry.getStore).not.toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should get storeState from global with scope id if matching', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      render(<Container scope="s1">{children}</Container>);

      expect(defaultRegistry.getStore).toHaveBeenCalledWith(
        Store,
        's1',
        expect.any(Object)
      );
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

      expect(defaultRegistry.getStore).toHaveBeenCalledWith(
        Store,
        's2',
        expect.any(Object)
      );
    });

    it('should get local storeState if local matching', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      render(<Container>{children}</Container>);

      expect(defaultRegistry.getStore).not.toHaveBeenCalled();
    });

    it('should get storeState from global registry when isGlobal is set', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      render(<Container isGlobal>{children}</Container>);

      expect(defaultRegistry.getStore).toHaveBeenCalledWith(
        Store,
        undefined,
        expect.any(Object)
      );
    });

    it('should cleanup from global on unmount if no more listeners', async () => {
      jest.spyOn(defaultRegistry, 'deleteStore');
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const { unmount } = render(<Container scope="s1">{children}</Container>);
      unmount();
      await actTick();

      expect(defaultRegistry.deleteStore).toHaveBeenCalledWith(Store, 's1');
    });

    it('should call Container onCleanup on unmount', async () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const { unmount } = render(<Container>{children}</Container>);
      unmount();
      await actTick();

      expect(mockOnContainerCleanupInner).toHaveBeenCalledTimes(1);
    });

    it('should not cleanup from global on unmount if still listeners', async () => {
      jest.spyOn(defaultRegistry, 'deleteStore');
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;

      // double render to simulate containers in different parts of the tree
      render(<Container scope="s1">{children}</Container>);
      const { unmount } = render(<Container scope="s1">{children}</Container>);
      unmount();
      await actTick();

      expect(defaultRegistry.deleteStore).not.toHaveBeenCalled();
    });

    it('should cleanup from global on scope change if no more listeners', async () => {
      jest.spyOn(defaultRegistry, 'deleteStore');
      StoreMock.actions.increase.mockReturnValue(({ setState }) => {
        setState({ count: 2 });
      });
      const Subscriber = createSubscriber(Store, { selector: (s) => s.count });
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      const { rerender } = render(<Container scope="s1">{children}</Container>);
      rerender(<Container scope="s2">{children}</Container>);
      await actTick();

      expect(defaultRegistry.deleteStore).toHaveBeenCalledWith(Store, 's1');
    });

    it('should not cleanup from global on unmount if not scoped', async () => {
      jest.spyOn(defaultRegistry, 'deleteStore');
      const { unmount } = render(<Container isGlobal>Content</Container>);
      unmount();
      await actTick();

      expect(defaultRegistry.deleteStore).not.toHaveBeenCalled();
    });

    it('should not cleanup from global if same type gets recreated meanwhile', async () => {
      jest.spyOn(defaultRegistry, 'deleteStore');
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      const { unmount } = render(<Container scope="s1">{children}</Container>);
      unmount();

      // given cleanup is scheduled, we fake the eventuality that it gets replaced in meantime
      defaultRegistry.stores.clear();
      defaultRegistry.getStore(Store, 's1');

      await actTick();

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

    it('should call Container onInit for every first render if override', () => {
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      render(
        <>
          <Container isGlobal>{children}</Container>
          <Container isGlobal>{children}</Container>
        </>
      );

      expect(mockOnContainerInitInner).toHaveBeenCalledTimes(2);
    });

    it('should call Container onInit only on first render if global and containedBy', () => {
      const onInit = jest.fn().mockReturnValue(() => {});
      const OtherContainer = createContainer();
      const OtherStore = createStore({
        name: 'other',
        initialState: StoreMock.initialState,
        actions: StoreMock.actions,
        handlers: { onInit },
        containedBy: OtherContainer,
      });
      const Subscriber = createSubscriber(OtherStore);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      render(
        <>
          <OtherContainer isGlobal>{children}</OtherContainer>
          <OtherContainer isGlobal>{children}</OtherContainer>
        </>
      );

      expect(onInit).toHaveBeenCalledTimes(1);
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
      act(() => increase());

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
      act(() => increase());

      expect(actionInner).toHaveBeenCalledWith(expect.any(Object), {
        defaultCount: 6,
      });
    });
  });
});
