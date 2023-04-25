import { useState } from "react";
import { useRouter } from "next/router";
import { graphql } from "@/__generated__";
import { useMutation } from "@apollo/client";
import { PhotoCategory, PostPhotoInput } from "@/__generated__/graphql";
import { ROOT_QUERY } from "@/pages/index";

const POST_PHOTO_MUTATION = graphql(`
  mutation postPhoto($input: PostPhotoInput!) {
    postPhoto(input: $input) {
      id
      name
      url
    }
  }
`);

const NewPhoto = () => {
  const router = useRouter();

  const [postPhoto, { loading, error }] = useMutation(POST_PHOTO_MUTATION, {
    update(cache, { data }) {
      const newPhoto = data?.postPhoto; // ミューテーションのレスポンス
      const existingCache = cache.readQuery({
        query: ROOT_QUERY,
      });

      // ミューテーションの結果に応じてcacheを更新する
      if (newPhoto && existingCache) {
        cache.writeQuery({
          query: ROOT_QUERY,
          data: {
            ...existingCache,
            allPhotos: [...existingCache?.allPhotos, newPhoto],
          },
        });
      }
    },
  });

  const [photoInfo, setPhotoInfo] = useState({
    name: "",
    description: "",
    category: "PORTRAIT" as PhotoCategory,
    file: "" as PostPhotoInput["file"],
  });

  const handlePostPhoto = async () => {
    console.log("🐳", photoInfo);
    if (!photoInfo.file) return;

    await postPhoto({ variables: { input: photoInfo } });
    await router.replace("/");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <h1>Post a Photo</h1>

      <input
        type="text"
        style={{ margin: "10px" }}
        placeholder="photo name..."
        value={photoInfo.name}
        onChange={({ target }) =>
          setPhotoInfo((prev) => {
            return { ...prev, name: target.value };
          })
        }
      />

      <textarea
        style={{ margin: "10px" }}
        placeholder="photo description..."
        value={photoInfo.description}
        onChange={({ target }) =>
          setPhotoInfo((prev) => {
            return { ...prev, description: target.value };
          })
        }
      />

      <select
        value={photoInfo.category}
        style={{ margin: "10px" }}
        onChange={({ target }) =>
          setPhotoInfo((prev) => {
            return { ...prev, category: target.value as PhotoCategory };
          })
        }
      >
        <option value="PORTRAIT">PORTRAIT</option>
        <option value="LANDSCAPE">LANDSCAPE</option>
        <option value="ACTION">ACTION</option>
        <option value="GRAPHIC">GRAPHIC</option>
      </select>

      <input
        type="file"
        style={{ margin: "10px" }}
        accept="image/jpeg"
        onChange={({ target }) =>
          setPhotoInfo((prev) => {
            return {
              ...prev,
              file: target.files && target.files.length ? target?.files[0] : "",
            };
          })
        }
      />

      <div style={{ margin: "10px" }}>
        <button onClick={() => handlePostPhoto()}>Post Photo</button>
        <button onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
};

export default NewPhoto;
