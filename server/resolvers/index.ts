import { Query } from './Query.js';
import { Mutation } from './Mutation.js';
import { Subscription } from './Subscription.js';
import { Type } from './Type.js';
import { Resolvers } from '../types/generated/graphql';

// トップレベルのリゾルバオブジェクト
export const resolvers: Resolvers = {
  Query,
  Mutation,
  Subscription,
  ...Type
};
