/* eslint-env jest */

import React, { useState } from 'react';
import { mount } from 'enzyme';

import { createHook } from '../../components/hook';
import defaults from '../../defaults';
import { createStore, defaultRegistry } from '../../store';
import supports from '../../utils/supported-features';
import { batch } from '../batched-updates';

const Store = createStore({
  initialState: { count: 0 },
  actions: {
    increment: () => ({ getState, setState }) => {
      setState({ count: getState().count + 1 });
    },
  },
});

const useHook = createHook(Store);

describe('batch', () => {
  const TestComponent = ({ children }) => {
    const [{ count }, actions] = useHook();
    const [localCount, setLocalCount] = useState(0);
    const update = () =>
      batch(() => {
        actions.increment();
        setLocalCount(localCount + 1);
      });

    return children(update, count, localCount);
  };

  beforeEach(() => {
    defaultRegistry.stores.clear();
  });

  it('should batch updates with scheduling disabled', () => {
    const child = jest.fn().mockReturnValue(null);
    mount(<TestComponent>{child}</TestComponent>);
    const update = child.mock.calls[0][0];
    update();

    expect(child.mock.calls).toHaveLength(2);
    expect(child.mock.calls[1]).toEqual([expect.any(Function), 1, 1]);
  });

  it('should batch updates with scheduling enabled', async () => {
    const supportsMock = jest
      .spyOn(supports, 'scheduling')
      .mockReturnValue(true);
    defaults.batchUpdates = true;

    const child = jest.fn().mockReturnValue(null);
    mount(<TestComponent>{child}</TestComponent>);
    const update = child.mock.calls[0][0];
    update();

    // scheduler uses timeouts on non-browser envs
    await new Promise((r) => setTimeout(r, 10));

    expect(child.mock.calls).toHaveLength(2);
    expect(child.mock.calls[1]).toEqual([expect.any(Function), 1, 1]);

    supportsMock.mockRestore();
    defaults.batchUpdates = false;
  });
});
