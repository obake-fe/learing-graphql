import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { PhotoCategory, Resolvers } from './types/generated/graphql';
import { ModelPhoto, ModelUser, Tag } from './types/generated/types';

// schema is `GraphQLSchema` instance
const schema = await loadSchema('schema.graphql', {
  // load from a single schema file
  loaders: [new GraphQLFileLoader()]
});

// ユニークIDをインクリメントするための変数
let _id = 4;

const users: ModelUser[] = [
  { githubLogin: 'mHattrup', name: 'Mike Hattrup' },
  { githubLogin: 'gPlake', name: 'Glen Plake' },
  { githubLogin: 'sSchmidt', name: 'Scot Schmidt' }
];

const photos: ModelPhoto[] = [
  {
    id: '1',
    name: 'Dropping the Heart Chute',
    description: 'The heart chute is one of my favorite chutes',
    category: 'ACTION' as PhotoCategory,
    githubUser: 'gPlake'
  },
  {
    id: '2',
    name: 'Enjoying the sunshine',
    category: 'SELFIE' as PhotoCategory,
    githubUser: 'sSchmidt'
  },
  {
    id: '3',
    name: 'Gunbarrel 25',
    description: '25 laps on gunbarrel today',
    category: 'LANDSCAPE' as PhotoCategory,
    githubUser: 'sSchmidt'
  }
];

const tags: Tag[] = [
  { photoID: '1', userID: 'gPlake' },
  { photoID: '2', userID: 'sSchmidt' },
  { photoID: '2', userID: 'mHattrup' },
  { photoID: '2', userID: 'gPlake' }
];

const resolvers: Resolvers = {
  Query: {
    // 写真を格納した配列の長さを返す
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  // postPhotoミューテーションと対応するリゾルバ
  Mutation: {
    postPhoto(parent, { input }) {
      // 新しい写真を作成し、idを生成する
      const id = String(_id++);
      let newPhoto: ModelPhoto = {
        id,
        name: input.name,
        description: input.description,
        category: input.category || ('PORTRAIT' as PhotoCategory)
      };
      photos.push(newPhoto);
      return newPhoto;
    }
  },
  // トリビアルリゾルバ
  Photo: {
    url: (parent) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
    taggedUsers: (parent) =>
      tags
        // 対象の写真が関係しているタグの配列を返す
        .filter((tag) => tag.photoID === parent.id)
        // タグの配列をユーザーIDの配列に変換する
        .map((tag) => tag.userID)
        // ユーザーIDの配列をユーザーオブジェクトの配列に変換する
        .map((userID) => users.find((u) => u.githubLogin === userID))
  },
  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) =>
      tags
        // 対象のユーザーが関係しているタグの配列を返す
        .filter((tag) => tag.userID === parent.name)
        // タグの配列を写真IDの配列に変換する
        .map((tag) => tag.photoID)
        // 写真IDの配列を写真オブジェクトの配列に変換する
        .map((photoID) => photos.find((p) => p.id === photoID))
  }
};

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

// サーバのインスタンスを作成
const server = new ApolloServer({
  schema: schemaWithResolvers
});

// webサーバを起動
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.token }),
  listen: { port: 4000 }
});
console.log(`🚀  Server ready at ${url}`);
