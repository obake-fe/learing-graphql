import Image from "next/image";
import { User } from "@/__generated__/graphql";
import { ObservableQuery, useMutation } from "@apollo/client";
import { gql } from "@/__generated__";
import { ROOT_QUERY } from "@/pages";

type OwnProps = {
  count: number;
  users: Pick<User, "githubLogin" | "name" | "avatar">[];
  refetchUsers: ObservableQuery["refetch"];
};

const ADD_FAKE_USERS_MUTATION = gql(`
   mutation addFakeUsers($count:Int!) {
    addFakeUsers(count:$count) {
      githubLogin
      name
      avatar
    }
  }
`);

export const UserList = ({
  count,
  users,
  refetchUsers,
}: OwnProps): JSX.Element => {
  const [addFakeUsers, { data, loading, error }] = useMutation(
    ADD_FAKE_USERS_MUTATION,
    {
      refetchQueries: [
        { query: ROOT_QUERY }, // DocumentNode object parsed with gql
        "allUsers", // Query name
      ],
    }
  );

  if (loading) return <p>Loading...</p>;
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
          if (!user.avatar) return null;
          return (
            <li key={user.githubLogin}>
              <Image src={user.avatar} width={48} height={48} alt="" />
              {user.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
