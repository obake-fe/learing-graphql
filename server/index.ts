import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `
	type Query {
		totalPhotos: Int!		
	}
`;

const resolvers = {
  Query: {
    totalPhotos: () => 42
  }
};

// サーバのインスタンスを作成
// その際、typeDefs(スキーマ)とリゾルバを引数に取る
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// webサーバを起動
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ token: req.headers.token }),
  listen: { port: 4000 }
});
console.log(`🚀  Server ready at ${url}`);
