import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';

// schema is `GraphQLSchema` instance
const schema = await loadSchema('schema.graphql', {
  // load from a single schema file
  loaders: [new GraphQLFileLoader()]
});

// 写真を格納するための配列を定義する
let photos = [];

const resolvers = {
  Query: {
    // 写真を格納した配列の長さを返す
    totalPhotos: () => photos.length
  }
  // postPhotoミューテーションと対応するリゾルバ
  // Mutation: {
  //   postPhoto(parent, args) {
  //     photos.push(args);
  //     return true;
  //   }
  // }
};

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

// サーバのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数に取る
const server = new ApolloServer({
  schema: schemaWithResolvers
});

// webサーバを起動
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.token }),
  listen: { port: 4000 }
});
console.log(`🚀  Server ready at ${url}`);
