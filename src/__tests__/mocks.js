/* eslint-env jest */

export const actionsMock = {
  increase: jest.fn(),
  decrease: jest.fn(),
};

export const StoreMock = {
  key: ['store-key'],
  initialState: { count: 0 },
  actions: actionsMock,
};

export const storeStateMock = {
  key: StoreMock.key,
  getState: () => {},
  setState: () => {},
  resetState: () => {},
  notify: () => {},
  subscribe: () => () => {},
  listeners: () => [],
  mutator: () => {},
};

export const registryMock = {
  configure: jest.fn(),
  getStoreState: jest.fn(),
  deleteStoreState: jest.fn(),
};
