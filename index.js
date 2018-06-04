const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const LessPluginLists = require('less-plugin-lists')
const IconfontWebpackPlugin = require('iconfont-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const IS_PROD = process.env.NODE_ENV === 'production'
const strip = (str, end) => str.substr(0, str.length-end.length)

module.exports = function (entry, output) {
  const src = path.basename(entry)
  const srcPath = strip(entry, src)
  const out = path.basename(output)
  const outPath = strip(output, out)
  const include = [path.resolve(srcPath), path.resolve('node_modules/@codeurs')]

  const plugin = {
    less: new MiniCssExtractPlugin({
      filename: path.parse(output).name + '.css'
    }),
    env: new webpack.EnvironmentPlugin(['NODE_ENV'])
  }

  const defaults = {
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|less)$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    output: {
      path: path.resolve(outPath),
      filename: out,
      publicPath: '/'
    },
    entry: path.resolve(entry)
  }

  function config(env) {
    console.log(`Compiling for ${env}`)
    const plugins = Object.values(plugin)
    if (process.env.ANALYZE)
      plugins.push(
        new BundleAnalyzerPlugin({
          analyzerHost: '0.0.0.0',
          analyzerPort: process.env.ANALYZE
        })
      )
    switch (env) {
      case 'development':
        return {
          ...defaults,
          devtool: '#inline-source-map',
          plugins
        }
      case 'production':
        return {
          ...defaults,
          plugins
        }
    }
  }

  return {
    ...config(process.env.NODE_ENV),
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: true,
      assets: false,
      chunks: false,
      modules: true,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      errorDetails: true,
      warnings: true,
      publicPath: false
    },
    resolve: {
      symlinks: false,
      modules: [srcPath, 'node_modules']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-env', {
                  modules: false,
                  loose: true,
                  targets: {
                    browsers: [
                        'last 2 versions',
                        'ie >= 9', 
                        'safari >= 7'
                      ]
                    }
                }]
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-transform-proto-to-assign',
                ['@babel/plugin-proposal-decorators', {legacy: true}],
                ['@babel/plugin-proposal-class-properties', {loose: true}],
                '@babel/plugin-proposal-object-rest-spread',
              ]
            }
          }
        },
        {
          test: /\.(css|less)$/,
          include,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                minimize: IS_PROD,
                sourceMap: !IS_PROD
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: !IS_PROD,
                plugins: loader => [
                  autoprefixer({grid: true}), 
                  new IconfontWebpackPlugin(loader)
                ]
              }
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: !IS_PROD,
                paths: [srcPath, 'node_modules'],
                plugins: [new LessPluginLists()]
              }
            }
          ]
        },
        {
          test: /\.(eot|ttf|woff|woff2)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'assets/fonts/[name].[ext]'
            }
          }
        },
        {
          test: /\.(svg|jpg|png|gif|ico)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'assets/images/[name].[ext]'
            }
          }
        },
        {
          test: /\.(glsl|obj|html)$/,
          use: 'raw-loader'
        }
      ]
    }
  }
}