import Image from "next/image";
import { UserItemFragmentDoc } from "@/__generated__/graphql";
import { FragmentType, graphql, useFragment } from "@/__generated__";

// Fragmentを使ったコロケーションについて
// https://the-guild.dev/blog/unleash-the-power-of-fragments-with-graphql-codegen
const USER_ITEM_FRAGMENT = graphql(`
  fragment userItem on User {
    name
    avatar
  }
`);

type OwnProps = {
  user: FragmentType<typeof UserItemFragmentDoc>;
};

const UserItem = (props: OwnProps): JSX.Element | null => {
  const user = useFragment(USER_ITEM_FRAGMENT, props.user);

  if (!user?.avatar) return null;

  return (
    <li>
      <Image src={user.avatar} width={48} height={48} alt="" />
      {user?.name}
    </li>
  );
};

export default UserItem;
