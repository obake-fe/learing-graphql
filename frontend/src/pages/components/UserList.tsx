import { UsersQuery } from "@/__generated__/graphql";
import { graphql } from "@/__generated__";
import { ObservableQuery, useMutation } from "@apollo/client";
import { ROOT_QUERY } from "@/pages";
import UserItem from "@/pages/components/UserItem";

const ADD_FAKE_USERS_MUTATION = graphql(`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count: $count) {
      githubLogin
      ...userItem
    }
  }
`);

type OwnProps = {
  count: UsersQuery["totalUsers"];
  users: UsersQuery["allUsers"];
  refetchUsers: ObservableQuery["refetch"];
};

const UserList = ({ count, users, refetchUsers }: OwnProps): JSX.Element => {
  const [addFakeUsers, { loading, error }] = useMutation(
    ADD_FAKE_USERS_MUTATION,
    {
      update(cache, { data }) {
        const newUsers = data?.addFakeUsers; // ミューテーションのレスポンス
        const existingUsers = cache.readQuery({
          query: ROOT_QUERY,
        });

        // ミューテーションの結果に応じてcacheを更新する
        if (newUsers && existingUsers) {
          cache.writeQuery({
            query: ROOT_QUERY,
            data: {
              totalUsers: newUsers.length,
              allUsers: [...existingUsers?.allUsers, ...newUsers],
              me: existingUsers.me,
            },
          });
        }
      },
    }
  );

  if (loading || !Array.isArray(users)) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <div>
      <p>{count} Users</p>
      <button onClick={() => refetchUsers()}>Refetch Users</button>
      <button onClick={() => addFakeUsers({ variables: { count: 1 } })}>
        Add Fake Users
      </button>
      <ul>
        {users.map((user) => {
          return <UserItem user={user} key={user.githubLogin} />;
        })}
      </ul>
    </div>
  );
};

export default UserList;
