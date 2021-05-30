import path from "path"
import webpack from "webpack"
import MiniCSSExtractPlugin from "mini-css-extract-plugin"

type MultiConfigurationFactory = (
  env: string | Record<string, boolean | number | string> | undefined,
  args: webpack.WebpackOptionsNormalized
) => webpack.Configuration[] | Promise<webpack.Configuration[]>

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

const babelLoaderConfiguration: webpack.RuleSetRule = {
  test: [/\.tsx?$/, /\.ts$/, /\.js$/],
  use: {
    loader: "babel-loader",
    options: {
      cacheDirectory: true,
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              browsers: ["last 1 versions"],
            },
          },
        ],
        "@babel/preset-typescript",
        "@babel/preset-react",
      ],
      plugins: [
        "@babel/plugin-transform-runtime",
        ["@babel/plugin-transform-typescript", { isTSX: true }],
        "@babel/plugin-transform-react-jsx",
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-transform-modules-commonjs",
      ],
    },
  },
}

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

const factory: MultiConfigurationFactory = (env, args) => [
  {
    entry: path.resolve(__dirname, "./src/index.web.tsx"),

    output: {
      path: path.resolve(__dirname, "dist/"),
    },

    target: "electron-renderer",

    module: {
      rules: [
        babelLoaderConfiguration,
        assetLoaderConfiguration,
        imageLoaderConfiguration,
        scssConfiguration,
        nodeConfiguration,
      ],
    },

    resolve: {
      alias: {
        "react-native": "react-native-web",
        dplayer: "@neneka/dplayer",
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

    plugins: [
      new webpack.DefinePlugin({
        __DEV__: args.mode !== "production",
      }),
      new MiniCSSExtractPlugin(),
    ],

    externals: {
      "webchimera.js": "commonjs webchimera.js",
    },
  },
]

module.exports = factory
