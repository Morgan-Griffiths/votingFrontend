const webpack = require("webpack");
const path = require("path");
const DIST = path.resolve(__dirname, "dist");
module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: DIST,
    publicPath: DIST,
  },
  devServer: {
    contentBase: "./src",
    port: 9011,
    writeToDisk: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_DEBUG": JSON.stringify(false), // needed by json-schema-ref-parser
      "process.platform": JSON.stringify(null), // needed by json-schema-ref-parser
    }),
  ],
};
