import { SubscriptionResolvers } from '../types/generated/graphql';

export const newPhotoTrigger = 'NEW_PHOTO';

export const Subscription: SubscriptionResolvers = {
  newPhoto: {
    subscribe: (parent, args, { pubsub }) =>
      pubsub.asyncIterator(newPhotoTrigger) as AsyncIterable<any>
  }
};
