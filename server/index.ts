import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { ModelUser } from './types/generated/types';
import { resolvers } from './resolvers/index.js';
import { MongoClient, ServerApiVersion } from 'mongodb';
import express from 'express';
import * as http from 'http';
import cors from 'cors';
// index.mjs (ESM)
import * as dotenv from 'dotenv';
dotenv.config();

// schema is `GraphQLSchema` instance
const schema = await loadSchema('schema.graphql', {
  // load from a single schema file
  loaders: [new GraphQLFileLoader()]
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const MONGO_DB = process.env.DB_HOST as string;
const client = new MongoClient(MONGO_DB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});
const database = client.db('test_db');

// Connect the client to the server (optional starting in v4.7)
await client.connect();
// Send a ping to confirm a successful connection
await client.db('test_db').command({ ping: 1 });
console.log('Pinged your deployment. You successfully connected to MongoDB!');

const app = express();
const httpServer = http.createServer(app);

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });

// サーバのインスタンスを作成
const server = new ApolloServer({
  schema: schemaWithResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

await server.start();

// ホームルート
app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));

// GraphQLエンドポイント及びPlayground
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await database.collection<ModelUser>('users').findOne({ githubToken });
      return { db: database, currentUser };
    }
  })
);

// webサーバを起動
await new Promise<void>((resolve) => httpServer.listen(4000, resolve as any));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);
