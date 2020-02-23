const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

/** @type import('webpack').Configuration */
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: { transpileOnly: true }
        },
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ template: "src/index.ejs" }),
    new CopyPlugin([{ from: "**/*", context: "public/" }])
  ],

  devServer: {
    contentBase: "public",
    open: true,
    disableHostCheck: true
  }
};
