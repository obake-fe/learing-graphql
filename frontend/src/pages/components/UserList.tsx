import Image from "next/image";
import { User } from "@/__generated__/graphql";
import { ObservableQuery } from "@apollo/client";

type OwnProps = {
  count: number;
  users: Pick<User, "githubLogin" | "name" | "avatar">[];
  refetchUsers: ObservableQuery["refetch"];
};

export const UserList = ({
  count,
  users,
  refetchUsers,
}: OwnProps): JSX.Element => {
  return (
    <div>
      <p>{count} Users</p>
      <button onClick={() => refetchUsers()}>Refetch Users</button>
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
