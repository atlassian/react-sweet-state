// @flow
import { type ActionApi } from 'react-sweet-state';
import type { UserModel, State } from './types';

// Dummy data
const USERS: UserModel[] = [
  { id: '1', name: 'Bob' },
  { id: '2', name: 'Paul' },
];

export const setLoading = () => ({ setState }: ActionApi<State>) => {
  setState({
    loading: true,
  });
};

export const load = () => async ({
  setState,
  getState,
  dispatch,
}: ActionApi<State>) => {
  if (getState().loading) return;
  dispatch(setLoading());
  // simulate async call
  await new Promise(r => setTimeout(r, 1000));
  setState({
    loading: false,
    data: USERS,
  });
};

export const select = (uid: string) => ({ setState }: ActionApi<State>) => {
  setState({
    selected: uid,
  });
};
