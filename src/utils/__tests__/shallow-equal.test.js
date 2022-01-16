/* eslint-env jest */

import shallowEqual from '../shallow-equal';

describe('shallowEqual', () => {
  describe('compare objects', () => {
    it('equal', () => {
      const a = { key1: 'value1', key2: 'value2' };
      const b = { key1: 'value1', key2: 'value2' };
      expect(shallowEqual(a, b)).toBe(true);
    });

    it('not equal by value', () => {
      const a = { key1: 'value1', key2: 'value2' };
      const b = { key1: 'value1', key2: 'value3' };
      expect(shallowEqual(a, b)).toBe(false);
    });

    it('not equal by number of keys', () => {
      const a = { key1: 'value1', key2: 'value2' };
      const b = { key1: 'value1', key2: 'value2', key3: 'value3' };
      expect(shallowEqual(a, b)).toBe(false);
    });
  });

  describe('compare arrays', () => {
    it('equal', () => {
      const a = [1, 'a'];
      const b = [1, 'a'];
      expect(shallowEqual(a, b)).toBe(true);
    });

    it('not equal by value', () => {
      const a = [1, 'a'];
      const b = [1, 'b'];
      expect(shallowEqual(a, b)).toBe(false);
    });

    it('not equal by number items', () => {
      const a = [1, 'a'];
      const b = [1, 'a', 2];
      expect(shallowEqual(a, b)).toBe(false);
    });
  });

  describe('compare dates', () => {
    it('not equal', () => {
      const dateA = new Date('2021-01-01T00:00:00');
      const dateB = new Date('2021-01-02T00:00:00');
      expect(shallowEqual(dateA, dateB)).toBe(false);
    });

    it('equal', () => {
      const dateA = new Date('2021-01-01T00:00:00');
      const dateB = new Date('2021-01-01T00:00:00');
      expect(shallowEqual(dateA, dateB)).toBe(true);
    });
  });
});
