const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const CleanCSSPlugin = require('less-plugin-clean-css')
const lessPluginGlob = require('less-plugin-glob')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const IconfontWebpackPlugin = require('iconfont-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

module.exports = function (entry, output) {
  const strip = (str, end) => str.substr(0, str.length-end.length)
  const src = path.basename(entry)
  const srcPath = strip(entry, src)
  const out = path.basename(output)
  const outPath = strip(output, out)

  const IS_PROD = process.env.NODE_ENV === 'production'
  const include = [path.resolve(srcPath)]

  const plugin = {
    ignore: new webpack.IgnorePlugin(/unicode/),
    less: new ExtractTextPlugin({
      filename: path.parse(output).name + '.css'
    }),
    env: new webpack.EnvironmentPlugin(['NODE_ENV'])
  }

  const defaults = {
    output: {
      path: path.resolve(outPath),
      filename: out
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
          analyzerPort: 29305
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
          plugins: [
            ...plugins,
            new webpack.optimize.UglifyJsPlugin({
              compress: {warnings: false}
            })
          ]
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
      modules: [srcPath, 'node_modules']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['babel-loader'],
          include
        },
        {
          test: /\.(css|less)$/,
          use: plugin.less.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  sourceMap: !IS_PROD
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  sourceMap: !IS_PROD,
                  plugins: loader => [autoprefixer, new IconfontWebpackPlugin(loader)]
                }
              },
              {
                loader: 'less-loader',
                options: {
                  sourceMap: !IS_PROD,
                  paths: [srcPath, 'node_modules']
                }
              }
            ]
          }),
          include
        },
        {
          test: /\.(eot|ttf|woff|woff2)$/,
          loader: 'file-loader?name=/fonts/[name].[ext]'
        },
        {
          test: /\.(svg|jpg|png)$/,
          loader: 'file-loader?name=/assets/[name].[ext]'
        },
        {
          test: /\.(glsl|obj)$/,
          use: 'raw-loader'
        }
      ]
    }
  }
}