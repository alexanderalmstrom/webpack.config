const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const history = require('connect-history-api-fallback')
const convert = require('koa-connect')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const WebpackAssetsManifest = require('webpack-assets-manifest')

const env = process.env.WEBPACK_SERVE ? 'development' : 'production'

const config = {
  mode: env,

  entry: './src/main.js',

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/'
  },

  serve: {
    port: 5000,
    content: path.resolve(__dirname, 'src'),
    devMiddleware: {
      publicPath: '/'
    },
    add: (app) => {
      app.use(convert(history()))
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: ["@babel/preset-env"],
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

  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: env == 'development'? true : false
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  },

  plugins: []
}

if (env == 'production') {
  config.output.filename = '[name].[contenthash].js'

  config.plugins.push(
    new CleanWebpackPlugin('build'),
    new CopyWebpackPlugin([
      {
        from: 'src/index.html',
        to: ''
      }
    ]),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    }),
    new WebpackAssetsManifest(),
    function () {
      this.plugin('done', function (stats) {
        const replaceInFile = function (filePath, replaceFrom, replaceTo) {
          const replacer = function (match) {
            console.log('Replacing in %s: %s => %s', filePath, match, replaceTo)
            return replaceTo
          }

          const str = fs.readFileSync(filePath, 'utf8')
          const out = str.replace(new RegExp(replaceFrom, 'g'), replacer)

          fs.writeFileSync(filePath, out)
        }

        const layoutPath = path.resolve(__dirname, 'build', 'index.html')
        const manifestPath = path.resolve(__dirname, 'build', 'manifest.json')
        const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

        for (let key in manifestData) {
          let value = manifestData[key]

          replaceInFile(layoutPath, key, value)
        }
      })
    }
  )
}

module.exports = config
