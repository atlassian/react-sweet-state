import React, { Profiler } from 'react';
import { TodosContainer, useTodos } from '../components/todos';

export const CaseMountLeaf = () => {
  useTodos();
  return null;
};

const COLLECTION = Array.from({ length: 10000 }).map((v, i) => (
  <TodosContainer key={i}>
    <CaseMountLeaf />
  </TodosContainer>
));

export const CaseMountContainerLocal = ({ onStart }: any) => (
  <Profiler id="mount" onRender={onStart}>
    {COLLECTION}
  </Profiler>
);

export default {
  id: 'mount-container-local',
  expectedTime: 600,
  Component: CaseMountContainerLocal,
};
