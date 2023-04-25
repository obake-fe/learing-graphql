import { MutationResolvers, PhotoCategory } from '../types/generated/graphql';
import { ModelPhoto, ModelUser } from '../types/generated/types';
import { authorizeWithGithub } from '../lib/index.js';
import { newPhotoTrigger, newUserTrigger } from './Subscription.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export const Mutation: MutationResolvers = {
  async postPhoto(parent, { input }, { db, currentUser, pubsub }) {
    // 1. コンテキストにユーザーがいなければエラーを投げる
    if (currentUser === null || Object.keys(currentUser).length === 0) {
      throw new Error('only an authorized user can post a photo');
    }

    // 2. 現在のユーザーのIDとphotoを保存する
    const newPhoto = {
      name: input.name,
      description: input.description,
      category: input.category ?? ('PORTRAIT' as PhotoCategory),
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

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const pathName = path.join(
      __dirname,
      '..',
      '..',
      'frontend',
      'public',
      'photos',
      `${insertedId}.jpg`
    );

    const { createReadStream } = input.file.file;
    const stream = createReadStream();
    await stream.pipe(fs.createWriteStream(pathName));

    // Subscription用にnewPhotoをkeyとするオブジェクトをpublishする
    await pubsub.publish(newPhotoTrigger, { newPhoto: { ...newPhoto, _id: insertedId } });

    return { ...newPhoto, _id: insertedId };
  },
  async githubAuth(parent, { code }, { db, pubsub }) {
    // 1. Githubからデータを取得する
    const { message, access_token, avatar_url, login, name } = await authorizeWithGithub({
      client_id: process.env.CLIENT_ID as string,
      client_secret: process.env.CLIENT_SECRET as string,
      code
    });

    // 2. メッセージがある場合は何らかのエラーが発生している
    if (typeof message !== 'undefined') {
      throw new Error(message);
    }

    // 3. データをひとつのオブジェクトにまとめる
    const latestUserInfo = {
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

    // Subscription用にnewUserをkeyとするオブジェクトをpublishする
    await pubsub.publish(newUserTrigger, { newUser: value });

    // 5. ユーザーデータとトークンを返す
    return {
      user: value as ModelUser,
      token: access_token
    };
  },
  // テスト用にダミーのユーザーデータを取得するミューテーション
  async addFakeUsers(parent, { count }, { db, pubsub }) {
    const randomUserApi = `https://randomuser.me/api/?results=${count}`;

    type FakeUser = {
      login: {
        username: string;
        sha1: string;
      };
      name: {
        first: string;
        last: string;
      };
      picture: {
        thumbnail: string;
      };
    };

    // 外部APIを使ってユーザーデータを取得する
    // @see https://randomuser.me/
    const { results }: { results: FakeUser[] } = await fetch(randomUserApi).then(
      async (res) => await res.json()
    );

    const users = results.map((r) => ({
      name: `${r.name.first} ${r.name.last}`,
      avatar: r.picture.thumbnail,
      githubLogin: r.login.username,
      githubToken: r.login.sha1
    }));

    const { insertedIds } = await db.collection<Omit<ModelUser, '_id'>>('users').insertMany(users);
    const fakeUsers = users.map((user, index) => {
      return { _id: insertedIds[index.toString()], ...user };
    });

    // Subscription用にnewUserをkeyとするオブジェクトをpublishする
    fakeUsers.forEach((newUser) => pubsub.publish(newUserTrigger, { newUser }));

    return fakeUsers;
  },
  // ダミーユーザーで認証する
  async fakeUserAuth(parent, { githubLogin }, { db }) {
    const user = await db.collection<ModelUser>('users').findOne({ githubLogin });

    if (user === null) {
      throw new Error(`Cannot find user with githubLogin ${githubLogin}`);
    }

    return {
      token: user.githubToken,
      user
    };
  }
};
