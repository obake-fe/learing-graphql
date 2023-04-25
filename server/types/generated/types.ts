import { PhotoCategory } from './graphql';
import { Db, ObjectId } from 'mongodb';
import { PubSub } from 'graphql-subscriptions/dist/pubsub';
import { ReadStream } from 'fs';

export type Context = {
  db: Db;
  currentUser: ModelUser | null;
  pubsub: PubSub;
};

export type ModelPhoto = {
  _id: ObjectId;
  name: string;
  description?: string | null;
  category: PhotoCategory;
  githubLogin?: string;
  created: unknown;
};

export type ModelUser = {
  _id: ObjectId;
  name: string;
  avatar: string;
  githubLogin: string;
  githubToken: string;
};

export type ModelTag = {
  photoID: ObjectId;
  githubLogin: string;
};

export type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => ReadStream;
};

export type Upload = {
  file: Promise<FileUpload>;
};
