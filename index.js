const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const IconfontWebpackPlugin = require('iconfont-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const FixDefaultImportPlugin = require('webpack-fix-default-import-plugin')

const strip = (str, end) => str.substr(0, str.length-end.length)

module.exports = function (entry, output, options = {}) {
  const src = path.basename(entry)
  const srcPath = strip(entry, src)
  const out = path.basename(output)
  const outPath = strip(output, out)
  const includes = options.include ? options.include : []
  const include = [...includes, path.resolve(srcPath), path.resolve('node_modules/@codeurs')]

  const plugin = {
    less: new ExtractTextPlugin({
      filename: path.parse(output).name + '.css',
      allChunks: true
    }),
    fixDefault: new FixDefaultImportPlugin()
  }

  const defaults = {
    output: {
      path: path.resolve(outPath),
      filename: out,
      publicPath: '/'
    },
    entry: path.resolve(entry)
  }

  function config(mode) {
    defaults.mode = mode
    console.log(`Compiling for ${mode}`)
    const plugins = Object.values(plugin)
    if (process.env.ANALYZE)
      plugins.push(
        new BundleAnalyzerPlugin({
          analyzerHost: '0.0.0.0',
          analyzerPort: process.env.ANALYZE
        })
      )
    switch (mode) {
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

  return (env, argv) => {
    const mode = argv.mode || process.env.NODE_ENV
    const isProd = mode === 'production'
    const target = config(mode)
    return {
      ...target, 
      plugins: [new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode)
      }), ...target.plugins],
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
        extensions: ['.js', '.ts', '.less', '.css'],
        modules: [srcPath, 'node_modules']
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            include,
            use: 'ts-loader'
          },
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
            use: plugin.less.extract({
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    minimize: isProd,
                    sourceMap: !isProd
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: !isProd,
                    plugins: loader => [
                      autoprefixer({grid: true}), 
                      new IconfontWebpackPlugin(loader)
                    ]
                  }
                },
                {
                  loader: 'less-loader',
                  options: {
                    sourceMap: !isProd,
                    paths: [srcPath, 'node_modules']
                  }
                }
              ]
            })
          },
          {
            test: /\.(eot|ttf|woff|woff2)$/,
            include,
            use: {
              loader: 'file-loader',
              options: {
                name: 'assets/fonts/[name].[ext]'
              }
            }
          },
          {
            test: /\.(svg|jpg|png|gif|ico)$/,
            include,
            use: {
              loader: 'file-loader',
              options: {
                name: 'assets/images/[name].[ext]'
              }
            }
          },
          {
            test: /\.(glsl|obj|html)$/,
            include,
            use: 'raw-loader'
          }
        ]
      }
    }
  }
}