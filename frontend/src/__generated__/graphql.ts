/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A valid date time value */
  DateTime: any;
  Upload: any;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String'];
  user: User;
};

/** ミューテーションによって新たに投稿されたPhotoを返します */
export type Mutation = {
  __typename?: 'Mutation';
  addFakeUsers: Array<User>;
  fakeUserAuth: AuthPayload;
  githubAuth: AuthPayload;
  postPhoto: Photo;
};


/** ミューテーションによって新たに投稿されたPhotoを返します */
export type MutationAddFakeUsersArgs = {
  count?: InputMaybe<Scalars['Int']>;
};


/** ミューテーションによって新たに投稿されたPhotoを返します */
export type MutationFakeUserAuthArgs = {
  githubLogin: Scalars['ID'];
};


/** ミューテーションによって新たに投稿されたPhotoを返します */
export type MutationGithubAuthArgs = {
  code: Scalars['String'];
};


/** ミューテーションによって新たに投稿されたPhotoを返します */
export type MutationPostPhotoArgs = {
  input: PostPhotoInput;
};

/** Photo型を定義します */
export type Photo = {
  __typename?: 'Photo';
  category: PhotoCategory;
  created: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  postedBy: User;
  taggedUsers: Array<User>;
  url: Scalars['String'];
};

export enum PhotoCategory {
  Action = 'ACTION',
  Graphic = 'GRAPHIC',
  Landscape = 'LANDSCAPE',
  Portrait = 'PORTRAIT',
  Selfie = 'SELFIE'
}

/** 写真投稿用関数の引数に渡す値 */
export type PostPhotoInput = {
  category?: InputMaybe<PhotoCategory>;
  description?: InputMaybe<Scalars['String']>;
  file: Scalars['Upload'];
  name: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  /** allPhotosはPhotoを返します */
  allPhotos: Array<Photo>;
  allUsers: Array<User>;
  me?: Maybe<User>;
  totalPhotos: Scalars['Int'];
  totalUsers: Scalars['Int'];
};

export type Subscription = {
  __typename?: 'Subscription';
  newPhoto: Photo;
  newUser: User;
};

export type User = {
  __typename?: 'User';
  avatar?: Maybe<Scalars['String']>;
  githubLogin: Scalars['ID'];
  inPhotos: Array<Photo>;
  name?: Maybe<Scalars['String']>;
  postedPhotos: Array<Photo>;
};

export type GithubAuthMutationVariables = Exact<{
  code: Scalars['String'];
}>;


export type GithubAuthMutation = { __typename?: 'Mutation', githubAuth: { __typename?: 'AuthPayload', token: string } };

export type MeInfoFragment = { __typename?: 'User', name?: string | null, avatar?: string | null } & { ' $fragmentName'?: 'MeInfoFragment' };

export type PhotoItemFragment = { __typename?: 'Photo', name: string, url: string } & { ' $fragmentName'?: 'PhotoItemFragment' };

export type UserItemFragment = { __typename?: 'User', name?: string | null, avatar?: string | null } & { ' $fragmentName'?: 'UserItemFragment' };

export type AddFakeUsersMutationVariables = Exact<{
  count: Scalars['Int'];
}>;


export type AddFakeUsersMutation = { __typename?: 'Mutation', addFakeUsers: Array<(
    { __typename?: 'User', githubLogin: string }
    & { ' $fragmentRefs'?: { 'UserItemFragment': UserItemFragment } }
  )> };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', totalUsers: number, allUsers: Array<(
    { __typename?: 'User', githubLogin: string }
    & { ' $fragmentRefs'?: { 'UserItemFragment': UserItemFragment } }
  )>, me?: (
    { __typename?: 'User' }
    & { ' $fragmentRefs'?: { 'MeInfoFragment': MeInfoFragment } }
  ) | null, allPhotos: Array<(
    { __typename?: 'Photo', id: string }
    & { ' $fragmentRefs'?: { 'PhotoItemFragment': PhotoItemFragment } }
  )> };

export type NewUserSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type NewUserSubscription = { __typename?: 'Subscription', newUser: { __typename?: 'User', githubLogin: string, name?: string | null, avatar?: string | null } };

export type PostPhotoMutationVariables = Exact<{
  input: PostPhotoInput;
}>;


export type PostPhotoMutation = { __typename?: 'Mutation', postPhoto: { __typename?: 'Photo', id: string, name: string, url: string } };

export const MeInfoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"meInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]} as unknown as DocumentNode<MeInfoFragment, unknown>;
export const PhotoItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"photoItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Photo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<PhotoItemFragment, unknown>;
export const UserItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"userItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]} as unknown as DocumentNode<UserItemFragment, unknown>;
export const GithubAuthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"githubAuth"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubAuth"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}}]}}]}}]} as unknown as DocumentNode<GithubAuthMutation, GithubAuthMutationVariables>;
export const AddFakeUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"addFakeUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addFakeUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"count"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubLogin"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"userItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"userItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]} as unknown as DocumentNode<AddFakeUsersMutation, AddFakeUsersMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalUsers"}},{"kind":"Field","name":{"kind":"Name","value":"allUsers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubLogin"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"userItem"}}]}},{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"meInfo"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allPhotos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"photoItem"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"userItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"meInfo"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"photoItem"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Photo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const NewUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"newUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"githubLogin"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}}]}}]}}]} as unknown as DocumentNode<NewUserSubscription, NewUserSubscriptionVariables>;
export const PostPhotoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"postPhoto"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PostPhotoInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"postPhoto"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<PostPhotoMutation, PostPhotoMutationVariables>;