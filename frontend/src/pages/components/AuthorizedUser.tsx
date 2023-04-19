import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { graphql } from "@/__generated__";
import { FetchResult, useMutation } from "@apollo/client";
import { ROOT_QUERY } from "@/pages";
import { GithubAuthMutation } from "@/__generated__/graphql";

const GITHUB_AUTH_MUTATION = graphql(`
  mutation githubAuth($code: String!) {
    githubAuth(code: $code) {
      token
    }
  }
`);

const AuthorizedUser = () => {
  const authorizationComplete = ({
    data,
  }: Omit<FetchResult<GithubAuthMutation>, "context">) => {
    console.log("🦖", data);
    if (data) localStorage.setItem("token", data.githubAuth.token);
    router.replace("/");
    setSignIn(false);
  };

  const [githubAuth, { data, loading, error }] = useMutation(
    GITHUB_AUTH_MUTATION,
    {
      refetchQueries: [{ query: ROOT_QUERY }, "users"],
      update: (cache, data) => authorizationComplete(data),
    }
  );

  const [signIn, setSignIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (window.location.search.match(/code=/)) {
      setSignIn(true);

      // URLに付与されたコードを削除して、内部的には記録する
      const code = window.location.search.replace("?code=", "");
      console.log("🦀", code);
      githubAuth({ variables: { code } });
    }
  }, [githubAuth]);

  const requestCode = () => {
    const clientID = process.env.NEXT_PUBLIC_CLIENT_ID;
    router.replace(
      `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`
    );
  };

  return (
    <button onClick={() => requestCode()} disabled={signIn}>
      Sign In with Github
    </button>
  );
};

export default AuthorizedUser;
