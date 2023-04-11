import { ApolloServer } from '@apollo/server';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { PhotoCategory, Resolvers } from './types/generated/graphql';
import { ModelPhoto, ModelUser, Tag } from './types/generated/types';
import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';
import express from 'express';
import * as http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { MongoClient, ServerApiVersion } from 'mongodb'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { authorizeWithGithub } from './lib/index.js';
// index.mjs (ESM)
import * as dotenv from 'dotenv';
dotenv.config();

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
    githubUser: 'gPlake',
    created: '3-28-1977'
  },
  {
    id: '2',
    name: 'Enjoying the sunshine',
    category: 'SELFIE' as PhotoCategory,
    githubUser: 'sSchmidt',
    created: '1-2-1985'
  },
  {
    id: '3',
    name: 'Gunbarrel 25',
    description: '25 laps on gunbarrel today',
    category: 'LANDSCAPE' as PhotoCategory,
    githubUser: 'sSchmidt',
    created: '2018-04-15T19:09:57.308Z'
  }
];

const tags: Tag[] = [
  { photoID: '1', userID: 'gPlake' },
  { photoID: '2', userID: 'sSchmidt' },
  { photoID: '2', userID: 'mHattrup' },
  { photoID: '2', userID: 'gPlake' }
];

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
    totalPhotos: (parent, args, { db }) => db.collection('photos').estimatedDocumentCount(),
    allPhotos: (parent, args, { db }) => db.collection('photos').find().toArray(),
    totalUsers: (parent, args, { db }) => db.collection('users').estimatedDocumentCount(),
    allUsers: (parent, args, { db }) => db.collection('users').find().toArray()
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
        category: input.category || ('PORTRAIT' as PhotoCategory),
        created: new Date()
      };
      photos.push(newPhoto);
      return newPhoto;
    },
    async githubAuth(parent, { code }) {
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
      await database
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

      // 5. ユーザーデータとトークンを返す
      return {
        user: {
          name,
          githubLogin: login
        },
        token: access_token
      };
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
    context: async ({ req }) => ({ token: req.headers.token })
  })
);

// webサーバを起動
await new Promise<void>((resolve) => httpServer.listen(4000, resolve as any));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);
