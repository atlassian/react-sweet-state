/* eslint-env jest */

import React, { useState } from 'react';
import { act, render } from '@testing-library/react';

import { createHook } from '../../components/hook';
import { createStore, defaultRegistry } from '../../store';
import supports from '../../utils/supported-features';
import { batch } from '../batched-updates';

const Store = createStore({
  initialState: { count: 0 },
  actions: {
    increment:
      () =>
      ({ getState, setState }) => {
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
    render(<TestComponent>{child}</TestComponent>);
    const update = child.mock.calls[0][0];
    act(() => update());

    // assertion no longer relevant with React 18+
    expect(child.mock.calls[2]).toEqual([expect.any(Function), 1, 1]);
  });

  it('should batch updates with scheduling enabled', async () => {
    const supportsMock = jest
      .spyOn(supports, 'scheduling')
      .mockReturnValue(true);

    const child = jest.fn().mockReturnValue(null);
    render(<TestComponent>{child}</TestComponent>);
    const update = child.mock.calls[0][0];
    act(() => update());

    // scheduler uses timeouts on non-browser envs
    await act(() => new Promise((r) => setTimeout(r, 10)));

    // assertion no longer relevant with React 18+
    expect(child.mock.calls[2]).toEqual([expect.any(Function), 1, 1]);

    supportsMock.mockRestore();
  });
});
