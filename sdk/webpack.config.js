const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  mode: "production", // Make sure to set this to production when building
  entry: "./src/errorSnap.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "errorSnap.js",
    library: "ErrorSnap",
    libraryExport: "default",
    libraryTarget: "umd",
    globalObject: "this",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.json", // Use tsconfig.json
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.ERROR_LOGS_API_URL": JSON.stringify(
        process.env.ERROR_LOGS_API_URL
      ),
    }),
  ],
};
