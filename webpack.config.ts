import path from "path"
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin"
import MiniCSSExtractPlugin from "mini-css-extract-plugin"
import webpack from "webpack"

type MultiConfigurationFactory = (
  env: string | Record<string, boolean | number | string> | undefined,
  args: webpack.WebpackOptionsNormalized
) => webpack.Configuration[]

const nodeConfiguration: webpack.RuleSetRule = {
  test: /\.node$/,
  loader: "node-loader",
}

const scssConfiguration: webpack.RuleSetRule = {
  test: /\.scss$/,
  use: [
    {
      loader: MiniCSSExtractPlugin.loader,
    },
    {
      loader: "css-loader",
      options: {
        importLoaders: 1,
      },
    },
    {
      loader: "postcss-loader",
    },
    {
      loader: "sass-loader",
    },
  ],
}

const babelLoaderConfiguration: (b: boolean) => webpack.RuleSetRule = (
  isDev
) => ({
  test: [/\.tsx?$/, /\.ts$/, /\.js$/],
  use: {
    loader: "babel-loader",
    options: {
      cacheDirectory: true,
      presets: [
        ["@babel/preset-env", { targets: { electron: "12" } }],
        "@babel/preset-typescript",
        "@babel/preset-react",
      ],
      plugins: [
        isDev && "react-refresh/babel",
        "@babel/plugin-transform-runtime",
        ["@babel/plugin-transform-typescript", { isTSX: true }],
        "@babel/plugin-transform-react-jsx",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-modules-commonjs",
      ].filter((s) => s),
    },
  },
})

const imageLoaderConfiguration: webpack.RuleSetRule = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: "url-loader",
    options: {
      name: "[name].[ext]",
      esModule: false,
    },
  },
}

const assetLoaderConfiguration: webpack.RuleSetRule = {
  test: /\.(ttf)$/,
  type: "asset/resource",
}

const factory: MultiConfigurationFactory = (env, args) => {
  const isDev = args.mode !== "production"
  return [
    {
      entry: path.resolve(__dirname, "./src/index.web.tsx"),

      output: {
        path: path.resolve(__dirname, "dist/"),
      },

      target: "electron-renderer",

      module: {
        rules: [
          babelLoaderConfiguration(isDev),
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
        // TODO: 型 'import("node_modules/tapable/tapable").SyncBailHook<[import("node_modules/webpack/types").Compilation], boolean, import("node_modules/tapable/tapable").UnsetAdditionalOptions>' を型 'import("node_modules/tapable/tapable").SyncBailHook<[import("node_modules/@types/mini-css-extract-plugin/node_modules/webpack/types").Compilation], boolean, import("node_modules/tapable/tapab...' に割り当てることはできません。ts(2322)
        new MiniCSSExtractPlugin() as never,
        isDev ? new ReactRefreshWebpackPlugin() : (undefined as never),
      ].filter((p: unknown) => p),
      externals: {
        "webchimera.js": "commonjs webchimera.js",
        react: "commonjs react",
        recoil: "commonjs recoil",
        "react-dom": "commonjs react-dom",
      },
    },
  ]
}

module.exports = factory
