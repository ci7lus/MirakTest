import path from "path"
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import MiniCSSExtractPlugin from "mini-css-extract-plugin"
import webpack from "webpack"
import {
  babelLoaderConfiguration,
  assetLoaderConfiguration,
  imageLoaderConfiguration,
  scssConfiguration,
  nodeConfiguration,
  workerConfiguration,
} from "./webpack-loaders"

type MultiConfigurationFactory = (
  env: string | Record<string, boolean | number | string> | undefined,
  args: webpack.WebpackOptionsNormalized
) => webpack.Configuration[]

const factory: MultiConfigurationFactory = (_, args) => {
  const isDev = args.mode !== "production"
  return [
    {
      entry: path.resolve(__dirname, "./src/index.web.tsx"),

      output: {
        path: path.resolve(__dirname, "dist/"),
      },

      target: "web",

      module: {
        rules: [
          babelLoaderConfiguration(isDev),
          workerConfiguration,
          assetLoaderConfiguration,
          imageLoaderConfiguration,
          scssConfiguration,
          nodeConfiguration,
        ],
      },

      resolve: {
        alias: {
          "react-native": "react-native-web",
          "react-query": "react-query/lib",
        },
        extensions: [
          ".webpack.js",
          ".web.ts",
          ".web.tsx",
          ".web.js",
          ".ts",
          ".tsx",
          ".js",
        ],
        fallback: { path: require.resolve("path-browserify") },
      },

      devServer: {
        hot: isDev,
        devMiddleware: { publicPath: "/dist" },
        static: {
          directory: __dirname,
          watch: false,
        },
        port: 10170,
      },

      plugins: [
        new webpack.DefinePlugin({
          "process.platform": JSON.stringify(process.platform),
        }),
        // TODO: 型 'import("node_modules/tapable/tapable").SyncBailHook<[import("node_modules/webpack/types").Compilation], boolean, import("node_modules/tapable/tapable").UnsetAdditionalOptions>' を型 'import("node_modules/tapable/tapable").SyncBailHook<[import("node_modules/@types/mini-css-extract-plugin/node_modules/webpack/types").Compilation], boolean, import("node_modules/tapable/tapab...' に割り当てることはできません。ts(2322)
        new MiniCSSExtractPlugin() as never,
        isDev
          ? new ReactRefreshWebpackPlugin({
              exclude: [/\.worker\.ts$/, /videoRenderer\.ts$/],
            })
          : (undefined as never),
      ].filter((p: unknown) => p),
    },
  ]
}

module.exports = factory
