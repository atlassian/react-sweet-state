// @flow
import React, { type AbstractComponent } from 'react';

import { UserContainer, UserSubscriber, useUser } from '../components/user';
import { type UserModel } from '../components/user/types';

type UserItemProps = {
  user: UserModel,
  isSelected: boolean,
  onClick: () => any,
};

const UserItem = ({ user, isSelected, onClick }: UserItemProps) => (
  <li
    className={'UserItem ' + (isSelected ? 'isSelected' : '')}
    onClick={onClick}
  >
    {user.name}
  </li>
);

type UserListProps = {
  users: UserModel[],
  loading: boolean,
  selected: string | null,
  onSelect: (id: string) => any,
};

const UserList = ({ users, selected, loading, onSelect }: UserListProps) =>
  loading ? (
    <div className="UserList">Loading...</div>
  ) : (
    <ul className="UserList">
      {users.map((user) => (
        <UserItem
          key={user.id}
          user={user}
          isSelected={user.id === selected}
          onClick={() => onSelect(user.id)}
        />
      ))}
    </ul>
  );

export const UserListRpc: AbstractComponent<{}> = () => (
  <UserContainer isGlobal>
    <UserSubscriber>
      {({ data, loading, selected }, { select }) => (
        <UserList
          users={data || []}
          loading={loading}
          selected={selected}
          onSelect={select}
        />
      )}
    </UserSubscriber>
  </UserContainer>
);

const UserListComponent = () => {
  const [{ data, loading, selected }, { select }] = useUser();
  return (
    <UserList
      users={data || []}
      loading={loading}
      selected={selected}
      onSelect={select}
    />
  );
};

export const UserListHook: AbstractComponent<{}> = () => (
  <UserContainer isGlobal>
    <UserListComponent />
  </UserContainer>
);
