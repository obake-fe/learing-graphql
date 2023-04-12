import { ModelPhoto, ModelUser } from '../types/generated/types';
import { QueryResolvers } from '../types/generated/graphql';

export const Query: QueryResolvers = {
  me: (parent, args, { currentUser }) => currentUser,
  totalPhotos: (parent, args, { db }) =>
    db.collection<ModelPhoto>('photos').estimatedDocumentCount(),
  allPhotos: (parent, args, { db }) => db.collection<ModelPhoto>('photos').find().toArray(),
  totalUsers: (parent, args, { db }) => db.collection<ModelUser>('users').estimatedDocumentCount(),
  allUsers: (parent, args, { db }) => db.collection<ModelUser>('users').find().toArray()
};
