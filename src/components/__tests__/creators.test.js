/* eslint-env jest */

import ContainerClass from '../container';
import SubscriberClass from '../subscriber';
import { createContainer, createSubscriber } from '../creators';
import { createStore } from '../../store';
import hash from '../../utils/hash';

jest.mock('../../utils/hash', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('creators', () => {
  beforeEach(() => {
    hash.mockReturnValue('mockedHash');
  });

  describe('createSubscriber', () => {
    it('should return a Subscriber component', () => {
      const updateFoo = () => {};
      const Store = createStore({
        initialState: {
          foo: 'bar',
        },
        actions: {
          updateFoo,
        },
        name: 'test',
      });
      const Subscriber = createSubscriber(Store);

      expect(Subscriber.prototype).toBeInstanceOf(SubscriberClass);
      expect(Subscriber.displayName).toEqual('Subscriber(test)');
      expect(Subscriber.storeType).toEqual({
        key: ['test', 'mockedHash'],
        initialState: {
          foo: 'bar',
        },
        actions: {
          updateFoo,
        },
      });
      expect(hash).toHaveBeenCalledWith('{"foo":"bar"}');
    });
  });
  describe('createContainer', () => {
    it('should return a Container component', () => {
      const updateFoo = () => {};
      const Store = createStore({
        initialState: {
          foo: 'bar',
        },
        actions: {
          updateFoo,
        },
        name: 'test',
      });
      const Container = createContainer(Store, {
        onInit: jest.fn(),
        onUpdate: jest.fn(),
      });

      expect(Container.prototype).toBeInstanceOf(ContainerClass);
      expect(Container.displayName).toEqual('Container(test)');
      expect(Container.storeType).toEqual({
        key: ['test', 'mockedHash'],
        initialState: {
          foo: 'bar',
        },
        actions: {
          updateFoo,
        },
      });
      expect(Container.hooks).toEqual({
        onInit: expect.any(Function),
        onUpdate: expect.any(Function),
      });
      expect(hash).toHaveBeenCalledWith('{"foo":"bar"}');
    });
  });

  describe('createSubscriber', () => {
    it('should return a component with selector', () => {
      const selectorMock = jest.fn();
      const Store = createStore({
        initialState: {
          foo: 'bar',
        },
        actions: {},
        name: 'test',
      });
      const SubscriberSelector = createSubscriber(Store, {
        selector: selectorMock,
        displayName: 'SubscriberSelector',
      });
      expect(SubscriberSelector.storeType).toEqual(Store);
      expect(SubscriberSelector.displayName).toEqual('SubscriberSelector');
      expect(SubscriberSelector.selector).toEqual(selectorMock);
    });
  });
});
