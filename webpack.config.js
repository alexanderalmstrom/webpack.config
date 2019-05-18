const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin  = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");

const cwd = process.cwd();

module.exports = (env, argv) => {
  // Common
  const commonConfig = {
    mode: argv.mode,

    entry: {
      app: path.resolve(cwd, "src", "index.js")
    },
  
    output: {
      filename: "[name].js",
      chunkFilename: "[name].js",
      path: path.resolve(cwd, "public"),
      publicPath: "/"
    },
  
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /\node_modules/,
          loader: "babel-loader"
        },
        {
          test: /\.(css|scss)$/,
          use: [
            {
              loader: argv.mode == "development" ? "style-loader" : CssExtractPlugin.loader
            },
            {
              loader: "css-loader",
              options: {
                sourceMap: argv.mode == "development" ? true : false,
                importLoaders: 2
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: argv.mode == "development" ? true : false,
                includePaths: ["node_modules"]
              }
            }
          ]
        }
      ]
    },

    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/
          }
        }
      }
    },
  
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        inject: false,
        template: path.resolve(cwd, "src", "index.ejs"),
        filename: "index.html",
        minify: {
          collapseWhitespace: true
        }
      })
    ]
  };
  
  // Development
  const devConfig = {
    devtool: "eval-source-map",

    devServer: {
      contentBase: path.resolve(cwd, "src"),
      watchContentBase: false,
      publicPath: "/",
      host: "0.0.0.0",
      disableHostCheck: true,
      port: 5000,
      hot: true,
      historyApiFallback: true
    },

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new WriteFilePlugin({
        test: /\.(html|js|css|svg)$/,
        useHashIndex: true
      })
    ]
  };
  
  // Production
  const prodConfig = {
    output: {
      filename: "[name].[hash].js",
      chunkFilename: "[name].[chunkhash].js"
    },

    optimization: {
      minimizer: [
        new OptimizeCSSAssetsPlugin(),
        new TerserPlugin({
          cache: true,
          parallel: true,
          sourceMap: false
        })
      ]
    },

    plugins: [
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(argv.mode)
      }),
      new CssExtractPlugin({
        filename: "[name].[hash].css",
        chunkFilename: "[name].[chunkhash].css"
      })
    ]
  };
  
  return merge(
    commonConfig,
    argv.mode == "development" ? devConfig : prodConfig
  );
};