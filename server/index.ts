import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { Photo, PhotoCategory, Resolvers } from './types/generated/graphql';

// schema is `GraphQLSchema` instance
const schema = await loadSchema('schema.graphql', {
  // load from a single schema file
  loaders: [new GraphQLFileLoader()]
});

// ユニークIDをインクリメントするための変数
let _id = 0;
// 写真を格納するための配列を定義する
let photos = [] as Photo[];

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
      let newPhoto: Photo = {
        id,
        url: `http://yoursite.com/img/${id}.jpg`,
        name: input.name,
        description: input.description,
        category: input.category || ('PORTRAIT' as PhotoCategory)
      };
      photos.push(newPhoto);
      return newPhoto;
    }
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
