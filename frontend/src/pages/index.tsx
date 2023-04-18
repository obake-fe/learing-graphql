import { UserList } from "@/pages/components/UserList";
import { useQuery } from "@apollo/client";
import { gql } from "@/__generated__";

export const ROOT_QUERY = gql(`query allUsers {
  totalUsers
  allUsers {
    githubLogin
    name
    avatar
  }
}`);

export default function Home() {
  const { loading, error, data, refetch } = useQuery(ROOT_QUERY);

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <>
      <h1>Hello Next.js</h1>
      <UserList
        count={data.totalUsers}
        users={data.allUsers}
        refetchUsers={refetch}
      />
    </>
  );
}
