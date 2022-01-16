import MiniCSSExtractPlugin from "mini-css-extract-plugin"
import webpack from "webpack"

export const babelLoaderConfiguration: (b: boolean) => webpack.RuleSetRule = (
  isDev
) => ({
  test: [/\.tsx?$/, /\.ts$/, /\.js$/],
  use: {
    loader: "babel-loader",
    options: {
      cacheDirectory: true,
      presets: [
        ["@babel/preset-env", { targets: { electron: "16" } }],
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

export const nodeConfiguration: webpack.RuleSetRule = {
  test: /\.node$/,
  loader: "node-loader",
}

export const scssConfiguration: webpack.RuleSetRule = {
  test: /\.s?css$/,
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

export const imageLoaderConfiguration: webpack.RuleSetRule = {
  test: /\.(gif|jpe?g|png|svg)$/,
  use: {
    loader: "url-loader",
    options: {
      name: "[name].[ext]",
      esModule: false,
    },
  },
}

export const assetLoaderConfiguration: webpack.RuleSetRule = {
  test: /\.(ttf)$/,
  type: "asset/resource",
}
