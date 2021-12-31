import path from "path"
import webpack from "webpack"
import { babelLoaderConfiguration } from "./webpack-loaders"

const nodeConfiguration: webpack.RuleSetRule = {
  test: /\.node$/,
  loader: "node-loader",
}

const config: webpack.Configuration = {
  entry: {
    "main.electron": path.resolve(__dirname, "./src/main/index.electron.ts"),
  },

  output: {
    path: path.resolve(__dirname, "dist/"),
  },

  target: "node12",

  module: {
    rules: [babelLoaderConfiguration(false), nodeConfiguration],
    parser: {
      javascript: { commonjsMagicComments: true },
    },
  },

  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: {
    "webchimera.js": "commonjs webchimera.js",
    "font-list": "commonjs font-list",
    electron: "commonjs electron",
  },

  optimization: {
    nodeEnv: false,
  },
}

module.exports = config
