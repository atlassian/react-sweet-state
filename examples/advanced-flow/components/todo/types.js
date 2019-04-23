// @flow

export type TodoModel = {
  title: string,
};

export type State = {
  data: TodoModel[] | null,
  loading: boolean,
};
