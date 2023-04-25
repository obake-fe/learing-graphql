import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { createUploadLink } from "apollo-upload-client";

// SSRのときにwindowオブジェクトが存在しないための対策
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : "";

const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: "ws://localhost:4000/graphql",
          connectionParams: {
            authToken: token,
          },
        })
      )
    : ApolloLink.from([]);

// それぞれのリクエストの認証ヘッダーにトークンを追加する
// https://www.apollographql.com/docs/react/api/link/introduction#stateless-links
const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers }) => ({
    headers: {
      ...headers,
      authorization: localStorage.getItem("token"), // however you get your token
      "Apollo-Require-Preflight": "true",
    },
  }));
  return forward(operation);
});

const httpLink = createUploadLink({
  uri: "http://localhost:4000/graphql",
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  ApolloLink.from([authLink, httpLink])
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
