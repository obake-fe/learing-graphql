import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: ["src/**/*.tsx"],
  generates: {
    "./src/__generated__/": {
      preset: "client",
      plugins: [],
      // presetConfig: {
      //   gqlTagName: "gql",
      // },
    },
  },
  ignoreNoDocuments: true, // for better experience with the watcher
};

export default config;
