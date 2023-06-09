/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  mutation githubAuth($code: String!) {\n    githubAuth(code: $code) {\n      token\n    }\n  }\n": types.GithubAuthDocument,
    "\n  fragment meInfo on User {\n    name\n    avatar\n  }\n": types.MeInfoFragmentDoc,
    "\n  fragment photoItem on Photo {\n    name\n    url\n  }\n": types.PhotoItemFragmentDoc,
    "\n  fragment userItem on User {\n    name\n    avatar\n  }\n": types.UserItemFragmentDoc,
    "\n  mutation addFakeUsers($count: Int!) {\n    addFakeUsers(count: $count) {\n      githubLogin\n      ...userItem\n    }\n  }\n": types.AddFakeUsersDocument,
    "\n  query users {\n    totalUsers\n    allUsers {\n      githubLogin\n      ...userItem\n    }\n    me {\n      ...meInfo\n    }\n    allPhotos {\n      id\n      ...photoItem\n    }\n  }\n": types.UsersDocument,
    "\n  subscription newUser {\n    newUser {\n      githubLogin\n      name\n      avatar\n    }\n  }\n": types.NewUserDocument,
    "\n  mutation postPhoto($input: PostPhotoInput!) {\n    postPhoto(input: $input) {\n      id\n      name\n      url\n    }\n  }\n": types.PostPhotoDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation githubAuth($code: String!) {\n    githubAuth(code: $code) {\n      token\n    }\n  }\n"): (typeof documents)["\n  mutation githubAuth($code: String!) {\n    githubAuth(code: $code) {\n      token\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment meInfo on User {\n    name\n    avatar\n  }\n"): (typeof documents)["\n  fragment meInfo on User {\n    name\n    avatar\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment photoItem on Photo {\n    name\n    url\n  }\n"): (typeof documents)["\n  fragment photoItem on Photo {\n    name\n    url\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment userItem on User {\n    name\n    avatar\n  }\n"): (typeof documents)["\n  fragment userItem on User {\n    name\n    avatar\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation addFakeUsers($count: Int!) {\n    addFakeUsers(count: $count) {\n      githubLogin\n      ...userItem\n    }\n  }\n"): (typeof documents)["\n  mutation addFakeUsers($count: Int!) {\n    addFakeUsers(count: $count) {\n      githubLogin\n      ...userItem\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query users {\n    totalUsers\n    allUsers {\n      githubLogin\n      ...userItem\n    }\n    me {\n      ...meInfo\n    }\n    allPhotos {\n      id\n      ...photoItem\n    }\n  }\n"): (typeof documents)["\n  query users {\n    totalUsers\n    allUsers {\n      githubLogin\n      ...userItem\n    }\n    me {\n      ...meInfo\n    }\n    allPhotos {\n      id\n      ...photoItem\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription newUser {\n    newUser {\n      githubLogin\n      name\n      avatar\n    }\n  }\n"): (typeof documents)["\n  subscription newUser {\n    newUser {\n      githubLogin\n      name\n      avatar\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation postPhoto($input: PostPhotoInput!) {\n    postPhoto(input: $input) {\n      id\n      name\n      url\n    }\n  }\n"): (typeof documents)["\n  mutation postPhoto($input: PostPhotoInput!) {\n    postPhoto(input: $input) {\n      id\n      name\n      url\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;