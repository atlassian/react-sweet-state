import { getConfig } from '@testing-library/react';

export function withStrict(n) {
  const { reactStrictMode } = getConfig();
  return reactStrictMode ? n * 2 : n;
}
