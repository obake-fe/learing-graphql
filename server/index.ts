import { ApolloServer } from '@apollo/server';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { PhotoCategory, Resolvers } from './types/generated/graphql';
import { ModelPhoto, ModelTag, ModelUser } from './types/generated/types';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import express from 'express';
import * as http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { authorizeWithGithub } from './lib/index.js';
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

const resolvers: Resolvers = {
  Query: {
    me: (parent, args, { currentUser }) => currentUser,
    totalPhotos: (parent, args, { db }) =>
      db.collection<ModelPhoto>('photos').estimatedDocumentCount(),
    allPhotos: (parent, args, { db }) => db.collection<ModelPhoto>('photos').find().toArray(),
    totalUsers: (parent, args, { db }) =>
      db.collection<ModelUser>('users').estimatedDocumentCount(),
    allUsers: (parent, args, { db }) => db.collection<ModelUser>('users').find().toArray()
  },
  Mutation: {
    async postPhoto(parent, { input }, { db, currentUser }) {
      // 1. コンテキストにユーザーがいなければエラーを投げる
      if (!currentUser) {
        throw new Error('only an authorized user can post a photo');
      }

      // 2. 現在のユーザーのIDとphotoを保存する
      const newPhoto = {
        name: input.name,
        description: input.description,
        category: input.category || ('PORTRAIT' as PhotoCategory),
        githubLogin: currentUser.githubLogin,
        created: new Date()
      };

      // 3.新しいphotoを追加して、データベースが生成したIDを取得する
      // If the operation successfully inserts a document,
      // it appends an insertedId field to the object passed in the method call,
      // and sets the value of the field to the _id of the inserted document.
      const { insertedId } = await db
        .collection<Omit<ModelPhoto, '_id'>>('photos')
        .insertOne(newPhoto);
      return { ...newPhoto, _id: insertedId };
    },
    async githubAuth(parent, { code }, { db }) {
      // 1. Githubからデータを取得する
      let { message, access_token, avatar_url, login, name } = await authorizeWithGithub({
        client_id: process.env.CLIENT_ID as string,
        client_secret: process.env.CLIENT_SECRET as string,
        code
      });

      // 2. メッセージがある場合は何らかのエラーが発生している
      if (message) {
        throw new Error(message);
      }

      // 3. データをひとつのオブジェクトにまとめる
      let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url
      };

      // 4. 新しい情報をもとにレコードを追加したり更新する
      const { value } = await db
        .collection<ModelUser>('users')
        .findOneAndReplace({ githubLogin: login }, latestUserInfo, {
          upsert: true,
          returnDocument: 'after' // replace後の値をkey名がvalueのオブジェクトとして返す
        });

      console.log('🐞', value);

      // 5. ユーザーデータとトークンを返す
      return {
        user: value as ModelUser,
        token: access_token
      };
    }
  },
  // トリビアルリゾルバ
  Photo: {
    id: (parent) => parent._id.toString(),
    url: (parent) => `http://yoursite.com/img/${parent._id}.jpg`,
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
