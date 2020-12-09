/* eslint-env jest */

import { createMemoizedSelector, createSelector } from '../create-selector';

describe('createMemoizedSelector', () => {
  describe('with dumb selector', () => {
    it('should return selector result', () => {
      const propsArg = undefined;
      const state = { foo: 1 };
      const selector = jest.fn((v) => ({ bar: v.foo }));

      const stateSelector = createMemoizedSelector(selector);
      const result = stateSelector(state, propsArg);

      expect(selector).toHaveBeenCalledWith(state, propsArg);
      expect(result).toEqual({ bar: 1 });
    });

    it('should return same result without running selector if 2nd argument is shallow equal', () => {
      const selector = jest.fn((v) => ({ bar: v.foo }));
      const stateSelector = createMemoizedSelector(selector);

      const state = { foo: 1 };
      const result1 = stateSelector(state, { baz: 1 });
      const result2 = stateSelector(state, { baz: 1 });
      expect(selector).toHaveBeenCalledTimes(1);
      expect(result2).toBe(result1);
    });

    it('should return same result if selector output is shallow equal', () => {
      const selector = jest.fn((v) => ({ bar: v.foo }));
      const stateSelector = createMemoizedSelector(selector);

      const result1 = stateSelector({ foo: 1 }, { baz: 1 });
      const result2 = stateSelector({ foo: 1, w: 1 }, { baz: 1 });
      expect(selector).toHaveBeenCalledTimes(2);
      expect(result2).toBe(result1);
    });

    it('should return same result if selector output is a shallow equal array', () => {
      const selector = jest.fn((v) => v.foo);
      const stateSelector = createMemoizedSelector(selector);

      const item = { id: 1 };
      const result1 = stateSelector({ foo: [item] });
      const result2 = stateSelector({ foo: [item], w: 1 });
      expect(selector).toHaveBeenCalledTimes(2);
      expect(result2).toBe(result1);
    });

    it('should return different result if selector output is not a shallow equal array', () => {
      const selector = jest.fn((v) => v.foo);
      const stateSelector = createMemoizedSelector(selector);

      const result1 = stateSelector({ foo: [{ id: 1 }] });
      const result2 = stateSelector({ foo: [{ id: 1 }] });
      expect(selector).toHaveBeenCalledTimes(2);
      expect(result2).not.toBe(result1);
    });
  });

  describe('with created selector', () => {
    it('should return selector result', () => {
      const propsArg = undefined;
      const state = { foo: 1 };
      const selector = jest.fn((v) => ({ bar: v.foo }));

      const stateSelector = createMemoizedSelector(
        createSelector(
          (s) => s,
          (_, p) => p,
          selector
        )
      );
      const result = stateSelector(state, propsArg);

      expect(selector).toHaveBeenCalledWith(state, propsArg);
      expect(result).toEqual({ bar: 1 });
    });
  });

  it('should return same result without running selector if input selectors output is equal', () => {
    const selector = jest.fn((v1, v2) => ({ bar: v1 + v2 }));
    const stateSelector = createMemoizedSelector(
      createSelector(
        (s) => s.foo,
        (_, p) => p.baz,
        selector
      )
    );

    const result1 = stateSelector({ foo: 1 }, { baz: 1 });
    const result2 = stateSelector({ foo: 1 }, { baz: 1 });
    expect(selector).toHaveBeenCalledTimes(1);
    expect(result2).toBe(result1);
  });

  it('should return same result if output is shallow equal', () => {
    const selector = jest.fn((v1, v2) => ({ bar: v1 + v2 }));
    const stateSelector = createMemoizedSelector(
      createSelector(
        (s) => s.foo,
        (_, p) => p.baz,
        selector
      )
    );

    const result1 = stateSelector({ foo: 1 }, { baz: 2 });
    const result2 = stateSelector({ foo: 2 }, { baz: 1 });
    expect(selector).toHaveBeenCalledTimes(2);
    expect(result2).toBe(result1);
  });

  it('should work with nested selectors', () => {
    const selector = jest.fn(([v1, v2]) => ({ bar: v1 + v2 }));
    const firstSelector = createSelector(
      (s) => s.foo,
      (_, p) => p.baz,
      (v1, v2) => [v1, v2]
    );
    const stateSelector = createMemoizedSelector(
      createSelector(firstSelector, selector)
    );
    const result1 = stateSelector({ foo: 1 }, { baz: 2 });
    // check memo input
    stateSelector({ foo: 1 }, { baz: 2 });
    expect(selector).toHaveBeenCalledTimes(1);
    // check memo output
    const result2 = stateSelector({ foo: 2 }, { baz: 1 });
    expect(selector).toHaveBeenCalledTimes(2);
    expect(result2).toBe(result1);
  });
});
