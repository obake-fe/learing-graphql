import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { graphql } from "@/__generated__";
import { ApolloClient, FetchResult, useMutation } from "@apollo/client";
import { ROOT_QUERY } from "@/pages";
import { GithubAuthMutation, UsersQuery } from "@/__generated__/graphql";
import Me from "@/components/Me";

const GITHUB_AUTH_MUTATION = graphql(`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`);

type OwnProps = {
  me: UsersQuery["me"];
  client: ApolloClient<UsersQuery>;
};

const AuthorizedUser = (props: OwnProps) => {
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  const authorizationComplete = ({
    data,
  }: Omit<FetchResult<GithubAuthMutation>, "context">) => {
    // 10. クライアント:GraphQLリクエストを送信するために利用するトークンを保存する
    if (data) localStorage.setItem("token", data.githubAuth.token);
    router.replace("/");
    setSigningIn(false);
  };

  const [githubAuth, { data, loading, error }] = useMutation(
    GITHUB_AUTH_MUTATION,
    {
      refetchQueries: [{ query: ROOT_QUERY }, "users"],
      update: (cache, data) => authorizationComplete(data),
    }
  );

  useEffect(() => {
    // 3. Github:コードを付けてWebサイトにリダイレクトする
    if (window.location.search.match(/code=/)) {
      setSigningIn(true);

      // URLに付与されたコードを削除して、内部的には記録する
      const code = window.location.search.replace("?code=", "");

      // 4. クライアント:先程のコードを使用してGraphQLミューテーションauthUser(code)を送信します
      githubAuth({ variables: { code } });
    }
  }, [githubAuth]);

  // 1. クライアント:client_idを付けてユーザーをGithubにリダイレクトする
  const requestCode = () => {
    const clientID = process.env.NEXT_PUBLIC_CLIENT_ID;
    router.replace(
      `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`
    );
  };

  return (
    <Me
      me={props.me}
      client={props.client}
      signingIn={signingIn}
      requestCode={requestCode}
    />
  );
};

export default AuthorizedUser;
