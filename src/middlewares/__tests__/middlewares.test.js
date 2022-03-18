/* eslint-env jest */

import { storeStateMock } from '../../__tests__/mocks';
import applyMiddleware from '..';
import defaults from '../../defaults';

jest.mock('../../defaults');

describe('applyMiddleware', () => {
  it('should always build update middleware', () => {
    defaults.mutator = jest.fn();
    const mutation = {};
    const combinedMw = applyMiddleware(storeStateMock, []);
    combinedMw(mutation);
    expect(defaults.mutator).toHaveBeenCalled();
  });

  it('should build combined middlewares', () => {
    const mutation = {};
    const middlewareSpy = jest.fn();
    const middleware = (storeState) => (next) => (fn) => {
      const result = next(fn);
      middlewareSpy(storeState, next, fn, result);
      return result;
    };

    const combinedMw = applyMiddleware(storeStateMock, [middleware]);
    combinedMw(mutation);
    expect(middlewareSpy).toHaveBeenCalledWith(
      storeStateMock,
      expect.any(Function),
      mutation,
      undefined
    );
  });
});
