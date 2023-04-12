import { MutationResolvers, PhotoCategory } from '../types/generated/graphql';
import { ModelPhoto, ModelUser } from '../types/generated/types';
import { authorizeWithGithub } from '../lib/index.js';

export const Mutation: MutationResolvers = {
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
};
