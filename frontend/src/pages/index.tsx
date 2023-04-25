import UserList from "@/pages/components/UserList";
import { useQuery, useSubscription } from "@apollo/client";
import { graphql } from "@/__generated__";
import AuthorizedUser from "@/pages/components/AuthorizedUser";
import { useEffect } from "react";
import PhotoList from "@/pages/components/PhotoList";

export const ROOT_QUERY = graphql(`
  query users {
    totalUsers
    allUsers {
      githubLogin
      ...userItem
    }
    me {
      ...meInfo
    }
    allPhotos {
      id
      ...photoItem
    }
  }
`);

const LISTEN_FOR_USERS = graphql(`
  subscription newUser {
    newUser {
      githubLogin
      name
      avatar
    }
  }
`);

export default function Home() {
  const { subscribeToMore, loading, error, data, refetch, client } =
    useQuery(ROOT_QUERY);

  useEffect(() => {
    subscribeToMore({
      document: LISTEN_FOR_USERS,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newUser = subscriptionData.data.newUser;
        const newUsers = [...prev.allUsers, newUser];

        return Object.assign({}, prev, {
          totalUsers: newUsers.length,
          allUsers: newUsers,
        });
      },
    });
  }, [subscribeToMore]);

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <>
      <h1>Hello Next.js</h1>
      <AuthorizedUser me={data.me} client={client} />
      <section style={{ display: "flex" }}>
        <UserList
          count={data.totalUsers}
          users={data.allUsers}
          refetchUsers={refetch}
        />
        <PhotoList photos={data.allPhotos} />
      </section>
    </>
  );
}
