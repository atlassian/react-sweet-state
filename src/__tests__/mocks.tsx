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
  getState: jest.fn(),
  setState: jest.fn(),
  resetState: jest.fn(),
  subscribe: jest.fn(),
  listeners: jest.fn(),
  mutator: jest.fn(),
};

export const registryMock = {
  configure: jest.fn(),
  getStoreState: jest.fn(),
  deleteStoreState: jest.fn(),
};
