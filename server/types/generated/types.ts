import { PhotoCategory } from './graphql';

export type ModelPhoto = {
  id: string;
  name: string;
  description?: string | null;
  category: PhotoCategory;
  githubUser?: string;
};

export type ModelUser = {
  githubLogin: string;
  name: string;
};
