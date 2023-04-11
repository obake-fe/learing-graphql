import { PhotoCategory } from './graphql';

export type ModelPhoto = {
  id: string;
  _id?: string;
  name: string;
  description?: string | null;
  category: PhotoCategory;
  githubLogin?: string;
  created: unknown;
};

export type ModelUser = {
  githubLogin: string;
  name: string;
};

export type Tag = {
  photoID: string;
  userID: string;
};
