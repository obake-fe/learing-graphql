import { ModelPhoto, ModelTag, ModelUser } from '../types/generated/types';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql/index.js';
import { Resolvers } from '../types/generated/graphql';

type TrivialResolverType = Pick<Resolvers, 'Photo' | 'User' | 'DateTime'>;

export const Type: TrivialResolverType = {
  // トリビアルリゾルバ
  Photo: {
    id: (parent) => parent._id.toString(),
    url: (parent) => `http://yoursite.com/img/${String(parent._id)}.jpg`,
    postedBy: (parent, args, { db }) => {
      return db.collection('users').findOne({ githubLogin: parent.githubLogin });
    },
    taggedUsers: async (parent, args, { db }) => {
      const tags: ModelTag[] = await db.collection<ModelTag>('tags').find().toArray();

      // 対象の写真が関係しているタグの配列を返し、ユーザーIDの配列に変換する
      const logins = tags.filter((t) => t.photoID === parent._id).map((t) => t.githubLogin);

      // ユーザーIDの配列をユーザーオブジェクトの配列に変換する
      return db
        .collection<ModelUser>('users')
        .find({ githubLogin: { $in: logins } }) // $inで配列内の値をOR検索する
        .toArray();
    }
  },
  User: {
    postedPhotos: (parent, args, { db }) =>
      db.collection<ModelPhoto>('photos').find({ githubLogin: parent.githubLogin }).toArray(),
    inPhotos: async (parent, args, { db }) => {
      const tags: ModelTag[] = await db.collection<ModelTag>('tags').find().toArray();

      // 対象のユーザーが関係しているタグの配列を返し、写真IDの配列に変換する
      const photoIDs = tags
        .filter((t) => t.githubLogin === parent.githubLogin)
        .map((t) => t.photoID);

      // 写真IDの配列を写真オブジェクトの配列に変換する
      return db
        .collection<ModelPhoto>('photos')
        .find({ _id: { $in: photoIDs } })
        .toArray();
    }
  },
  DateTime: new GraphQLScalarType<Date, unknown>({
    name: 'DateTime',
    description: 'A valid date time value',
    // GraphQL 上の値を内部データへ変換
    parseValue: (inputValue) => {
      if (typeof inputValue === 'string') {
        const d = new Date(inputValue);

        if (isNaN(d.getTime())) {
          throw new GraphQLError('invalid date');
        }

        return d;
      }
      throw new GraphQLError('non string value');
    },
    serialize: (outputValue: any) => {
      // 内部データを GraphQL上の表現へ変換
      return new Date(outputValue).toISOString();
      // throw new GraphQLError('non date');
    },
    // GraphQL 上の表現を内部データへ変換
    parseLiteral: (valueNode) => {
      if (valueNode.kind === Kind.STRING) {
        const d = new Date(valueNode.value);

        if (isNaN(d.getTime())) {
          throw new GraphQLError('invalid date');
        }

        return d;
      }
      throw new GraphQLError('non string value');
    }
  })
};
