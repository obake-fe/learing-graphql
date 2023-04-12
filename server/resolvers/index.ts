import { Query } from './Query.js';
import { Mutation } from './Mutation.js';
import { Type } from './Type.js';
import { Resolvers } from '../types/generated/graphql';

export const resolvers: Resolvers = {
  Query,
  Mutation,
  ...Type
};
