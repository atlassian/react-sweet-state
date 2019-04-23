// @flow

export type UserModel = {
  id: string,
  name: string,
};

export type State = {
  selected: string | null,
  data: UserModel[] | null,
  loading: boolean,
};
