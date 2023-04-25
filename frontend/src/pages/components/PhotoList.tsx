import { UsersQuery } from "@/__generated__/graphql";
import PhotoItem from "@/pages/components/PhotoItem";

type OwnProps = {
  photos: UsersQuery["allPhotos"];
};

const PhotoList = ({ photos }: OwnProps) => {
  return (
    <div>
      <ul>
        {photos.map((photo) => {
          return <PhotoItem photo={photo} key={photo.id} />;
        })}
      </ul>
    </div>
  );
};

export default PhotoList;
