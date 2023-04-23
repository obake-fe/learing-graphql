import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ModelUser } from './types/generated/types';
import { resolvers } from './resolvers/index.js';
import { MongoClient, ServerApiVersion } from 'mongodb';
import express from 'express';
import * as http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import bodyParser from 'body-parser';
// index.mjs (ESM)
import * as dotenv from 'dotenv';
dotenv.config();

// typeDefs is `GraphQLSchema` instance
const typeDefs = await loadSchema('schema.graphql', {
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

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = http.createServer(app);
const pubsub = new PubSub(); // Publish and Subscribe, Publish -> everyone gets to hear it

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'
});

// Save the returned server's info, so we can shut down this server later
const serverCleanup = useServer(
  {
    schema,
    context: async () => {
      // This will be run every time the client sends a subscription request
      return { db: database, pubsub };
    }
  },
  wsServer
);

// サーバのインスタンスを作成
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          }
        };
      }
    }
  ]
});

await server.start();

// ホームルート
app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'));

// GraphQLエンドポイント及びPlayground
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const githubToken = req.headers.authorization;
      const currentUser = await database.collection<ModelUser>('users').findOne({ githubToken });
      return { db: database, currentUser, pubsub };
    }
  })
);

// webサーバを起動
const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});
