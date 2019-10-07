/* eslint-env jest */

import React from 'react';
import { shallow, mount } from 'enzyme';

import { StoreMock, storeStateMock } from '../../__tests__/mocks';
import { defaultRegistry, StoreRegistry } from '../../store/registry';
import { createStore } from '../../store';
import { createContainer } from '../container';
import { createSubscriber } from '../subscriber';

const mockRegistry = {
  configure: jest.fn(),
  getStore: jest.fn(),
  deleteStore: jest.fn(),
};

jest.mock('../../store/registry', () => ({
  __esModule: true,
  StoreRegistry: jest.fn(),
  defaultRegistry: {
    configure: jest.fn(),
    getStore: jest.fn(),
    deleteStore: jest.fn(),
  },
}));

const mockOnContainerInitInner = jest.fn();
const mockOnContainerUpdateInner = jest.fn();
const Store = createStore({
  name: 'test',
  initialState: StoreMock.initialState,
  actions: StoreMock.actions,
});
const Container = createContainer(Store, {
  onInit: () => mockOnContainerInitInner,
  onUpdate: () => mockOnContainerUpdateInner,
});

describe('Container', () => {
  beforeEach(() => {
    const getStoreReturn = {
      storeState: storeStateMock,
      actions: StoreMock.actions,
    };
    defaultRegistry.getStore.mockReturnValue(getStoreReturn);
    StoreRegistry.mockImplementation(() => mockRegistry);
    mockRegistry.getStore.mockReturnValue(getStoreReturn);
    storeStateMock.getState.mockReturnValue(StoreMock.initialState);
  });

  describe('createContainer', () => {
    it('should return a Container component', () => {
      expect(Container.displayName).toEqual('Container(test)');
      expect(Container.storeType).toEqual(Store);
      expect(Container.hooks).toEqual({
        onInit: expect.any(Function),
        onUpdate: expect.any(Function),
      });
    });
  });

  describe('constructor', () => {
    it('should create local store registry', () => {
      expect(StoreRegistry).not.toHaveBeenCalled();
      shallow(
        <Container>
          <div />
        </Container>
      );

      expect(StoreRegistry).toHaveBeenCalledWith('__local__');
    });
  });

  describe('render', () => {
    it('should render context provider with value prop and children', () => {
      const children = <div />;
      const wrapper = shallow(<Container>{children}</Container>);
      expect(wrapper.name()).toEqual('ContextProvider');
      expect(wrapper.props()).toEqual({
        children,
        value: {
          getStore: expect.any(Function),
          globalRegistry: undefined, // shallow() context support is buggy
        },
      });
    });
  });

  describe('integration', () => {
    it('should get storeState from global with scope id if matching', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const wrapper = mount(<Container scope="s1">{children}</Container>);
      expect(defaultRegistry.getStore).toHaveBeenCalledWith(Store, 's1');
      expect(wrapper.instance().registry.getStore).not.toHaveBeenCalled();
    });

    it('should get closer storeState with scope id if matching', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const OtherStore = createStore({
        initialState: {},
        actions: {},
      });
      const OtherContainer = createContainer(OtherStore);
      mount(
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
      const wrapper = mount(<Container>{children}</Container>);
      expect(wrapper.instance().registry.getStore).toHaveBeenCalledWith(
        Store,
        undefined
      );
      expect(defaultRegistry.getStore).not.toHaveBeenCalled();
    });

    it('should get storeState from global registry when isGlobal is set', () => {
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const wrapper = mount(<Container isGlobal>{children}</Container>);
      expect(defaultRegistry.getStore).toHaveBeenCalledWith(Store, undefined);
      expect(wrapper.instance().registry.getStore).not.toHaveBeenCalled();
    });

    it('should cleanup from global on unmount if no more listeners', () => {
      storeStateMock.subscribe.mockReturnValue(jest.fn());
      storeStateMock.listeners.mockReturnValue([]);
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const wrapper = mount(<Container scope="s1">{children}</Container>);
      wrapper.unmount();
      expect(defaultRegistry.deleteStore).toHaveBeenCalledWith(Store, 's1');
    });

    it('should not cleanup from global on unmount if still listeners', () => {
      storeStateMock.subscribe.mockReturnValue(jest.fn());
      storeStateMock.listeners.mockReturnValue([jest.fn()]);
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const wrapper = mount(<Container scope="s1">{children}</Container>);
      wrapper.unmount();
      expect(defaultRegistry.deleteStore).not.toHaveBeenCalled();
    });

    it('should cleanup from global on id change if no more listeners', () => {
      storeStateMock.subscribe.mockReturnValue(jest.fn());
      storeStateMock.listeners.mockReturnValue([]);
      const Subscriber = createSubscriber(Store);
      const children = <Subscriber>{() => null}</Subscriber>;
      const wrapper = mount(<Container scope="s1">{children}</Container>);
      wrapper.setProps({ scope: 's2' });
      expect(defaultRegistry.deleteStore).toHaveBeenCalledWith(Store, 's1');
    });

    it('should call Container onInit on first render', () => {
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      mount(<Container defaultCount={5}>{children}</Container>);
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
      const wrapper = mount(<Container defaultCount={5}>{children}</Container>);
      wrapper.setProps({ defaultCount: 6 });
      expect(mockOnContainerInitInner).toHaveBeenCalledTimes(1);
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
      mount(<Container defaultCount={5}>{children}</Container>);
      const [, { increase }] = renderPropChildren.mock.calls[0];
      increase();
      expect(actionInner).toHaveBeenCalledWith(
        {
          getState: expect.any(Function),
          setState: expect.any(Function),
          actions: expect.any(Object),
          dispatch: expect.any(Function),
        },
        { defaultCount: 5 }
      );
    });

    it('should pass fresh props to subscriber actions when they change', () => {
      const actionInner = jest.fn();
      StoreMock.actions.increase.mockReturnValue(actionInner);
      const Subscriber = createSubscriber(Store);
      const renderPropChildren = jest.fn().mockReturnValue(null);
      const children = <Subscriber>{renderPropChildren}</Subscriber>;
      const wrapper = mount(<Container defaultCount={5}>{children}</Container>);
      const [, { increase }] = renderPropChildren.mock.calls[0];
      wrapper.setProps({ defaultCount: 6 });
      increase();
      expect(actionInner).toHaveBeenCalledWith(
        {
          getState: expect.any(Function),
          setState: expect.any(Function),
          actions: expect.any(Object),
          dispatch: expect.any(Function),
        },
        { defaultCount: 6 }
      );
    });
  });
});
