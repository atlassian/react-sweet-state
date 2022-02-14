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

  describe('compare native objects and object wrappers', () => {
    describe('Date', () => {
      it('equal', () => {
        const valueA = new Date('2021-01-01T00:00:00');
        const valueB = new Date('2021-01-01T00:00:00');
        expect(shallowEqual(valueA, valueB)).toBe(true);
      });

      it('not equal', () => {
        const valueA = new Date('2021-01-01T00:00:00');
        const valueB = new Date('2021-01-01T00:00:01');
        expect(shallowEqual(valueA, valueB)).toBe(false);
      });
    });

    describe('String', () => {
      it('equal', () => {
        const valueA = new String('foo');
        const valueB = new String('foo');
        expect(shallowEqual(valueA, valueB)).toBe(true);
      });

      it('not equal', () => {
        const valueA = new String('foo');
        const valueB = new String('bar');
        expect(shallowEqual(valueA, valueB)).toBe(false);
      });
    });

    describe('Number', () => {
      it('equal', () => {
        const valueA = new Number('1');
        const valueB = new Number('1');
        expect(shallowEqual(valueA, valueB)).toBe(true);
      });

      it('not equal', () => {
        const valueA = new Number('1');
        const valueB = new Number('2');
        expect(shallowEqual(valueA, valueB)).toBe(false);
      });
    });

    describe('RegExp', () => {
      it('equal', () => {
        const valueA = new RegExp('.*', 'g');
        const valueB = new RegExp('.*', 'g');
        expect(shallowEqual(valueA, valueB)).toBe(true);
      });

      it('not equal', () => {
        const valueA = new RegExp('.*', 'g');
        const valueB = new RegExp('.+', 'g');
        expect(shallowEqual(valueA, valueB)).toBe(false);
      });
    });
  });
});
