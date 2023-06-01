import React, { Profiler } from 'react';
import { useTodos } from '../components/todos';

export const CaseMountLeaf = () => {
  useTodos();
  return null;
};

const COLLECTION = Array.from({ length: 10000 }).map((v, i) => (
  <CaseMountLeaf key={i} />
));

export const CaseMountHook = ({ onStart }: any) => (
  <Profiler id="mount" onRender={onStart}>
    {COLLECTION}
  </Profiler>
);

export default {
  id: 'mount-hook',
  expectedTime: 300,
  Component: CaseMountHook,
};
