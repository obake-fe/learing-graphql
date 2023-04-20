import { MeInfoFragmentDoc, UsersQuery } from "@/__generated__/graphql";
import Image from "next/image";
import { FragmentType, graphql, useFragment } from "@/__generated__";
import { ApolloClient } from "@apollo/client";

const ME_INFO_FRAGMENT = graphql(`
  fragment meInfo on User {
    name
    avatar
  }
`);

type OwnProps = {
  me: FragmentType<typeof MeInfoFragmentDoc>;
  client: ApolloClient<UsersQuery>;
  signingIn: boolean;
  requestCode: () => void;
};

const Me = (props: OwnProps) => {
  const me = useFragment(ME_INFO_FRAGMENT, props.me);

  const logout = async () => {
    localStorage.removeItem("token");
    // キャッシュをクリアして再描画させる
    await props.client.resetStore();
  };

  return (
    <>
      {!me || !me.avatar ? (
        <button onClick={() => props.requestCode()} disabled={props.signingIn}>
          Sign In with Github
        </button>
      ) : (
        <div>
          <Image src={me.avatar} width={48} height={48} alt="" />
          <h2>{me.name}</h2>
          <button onClick={logout}>logout</button>
        </div>
      )}
    </>
  );
};

export default Me;
