/* eslint-env jest */

export const actionsMock = {
  increase: jest.fn(),
  decrease: jest.fn(),
};

export const StoreMock = {
  key: 'store-key',
  initialState: { count: 0 },
  actions: actionsMock,
};

export const storeStateMock = {
  key: StoreMock.key + '@scope',
  getState: () => {},
  setState: () => {},
  resetState: () => {},
  notify: () => {},
  subscribe: () => () => {},
  listeners: () => new Set(),
  mutator: () => {},
};
