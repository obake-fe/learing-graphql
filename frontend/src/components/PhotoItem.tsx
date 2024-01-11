import Image from "next/image";
import { FragmentType, graphql, useFragment } from "@/__generated__";
import { PhotoItemFragmentDoc } from "@/__generated__/graphql";

const PHOTOS_FRAGMENT = graphql(`
  fragment photoItem on Photo {
    name
    url
  }
`);

type OwnProps = {
  photo: FragmentType<typeof PhotoItemFragmentDoc>;
};

const PhotoItem = (props: OwnProps) => {
  const photo = useFragment(PHOTOS_FRAGMENT, props.photo);

  return (
    <li>
      <Image src={photo.url} alt={photo.name} width={100} height={100} />
    </li>
  );
};

export default PhotoItem;
