const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const RevPlugin = require('./plugins/RevPlugin')

const env = process.env.NODE_ENV

const config = {
  mode: env,

  entry: {
    main: './src/main.js'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/'
  },

  devServer: {
    contentBase: path.resolve(__dirname, 'src'),
    watchContentBase: true,
    host: '0.0.0.0',
    disableHostCheck: true,
    port: 5000,
    hot: true,
    historyApiFallback: true
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: env == 'development' ? 'style-loader' : MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: env == 'development' ? true : false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['node_modules'],
              sourceMap: env == 'development' ? true : false
            }
          }
        ]
      },
      {
        test: /\.(png|jpg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              context: 'src/images',
              name: env == 'development' ? '[path][name].[ext]' : '[path][name]-[hash].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      }
    ]
  },

  plugins: []
}

if (env == 'development') {
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}

if (env == 'production') {
  config.output.filename = '[name]-[hash].js'

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.CONTENTFUL_SPACE_ID': JSON.stringify(process.env.CONTENTFUL_SPACE_ID),
      'process.env.CONTENTFUL_ACCESS_TOKEN': JSON.stringify(process.env.CONTENTFUL_ACCESS_TOKEN),
      'process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN': JSON.stringify(process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN),
      'process.env.CONTENTFUL_PREVIEW': JSON.stringify(process.env.CONTENTFUL_PREVIEW),
      'process.env.CONTENTFUL_MANAGEMENT_TOKEN': JSON.stringify(process.env.CONTENTFUL_MANAGEMENT_TOKEN),
      'process.env.CONTENTFUL_DEFAULT_LOCALE': JSON.stringify(process.env.CONTENTFUL_DEFAULT_LOCALE),
      'process.env.CONTENTFUL_ENVIRONMENT': JSON.stringify(process.env.CONTENTFUL_ENVIRONMENT),
      'process.env.KLARNA_USERNAME': JSON.stringify(process.env.KLARNA_USERNAME),
      'process.env.KLARNA_PASSWORD': JSON.stringify(process.env.KLARNA_PASSWORD),
      'process.env.SITE_URL': JSON.stringify(process.env.SITE_URL),
      'process.env.DEFAULT_COUNTRY': JSON.stringify(process.env.DEFAULT_COUNTRY),
      'process.env.DEFAULT_CURRENCY': JSON.stringify(process.env.DEFAULT_CURRENCY),
      'process.env.DEFAULT_LOCALE': JSON.stringify(process.env.DEFAULT_LOCALE)
    }),
    new CleanWebpackPlugin('build'),
    new CopyWebpackPlugin([
      {
        from: './src/index.html',
        to: ''
      }
    ]),
    new MiniCssExtractPlugin({
      filename: '[name]-[hash].css'
    }),
    new OptimizeCSSAssetsPlugin(),
    new ManifestPlugin({
      basePath: '/',
      filter: function (file) {
        return file.isChunk
      }
    }),
    new RevPlugin({
      manifest: path.resolve(__dirname, 'build', 'manifest.json'),
      files: [
        path.resolve(__dirname, 'build', 'index.html')
      ]
    })
  )
}

module.exports = config
