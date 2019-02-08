const transpilers = require('./transpilers')
const path = require('path')
const webpack = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const IconfontWebpackPlugin = require('iconfont-webpack-plugin')
const cssNano = require('cssnano')
const pxtorem = require('postcss-pxtorem')

const strip = (str, end) => str.substr(0, str.length - end.length)

const config = context => {
  const {mode, entry, out, outPath} = context
  const plugins = transpilers.slice()
  if (process.env.ANALYZE)
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerHost: '0.0.0.0',
        analyzerPort: process.env.ANALYZE
      })
    )
  return {
    devtool: mode !== 'production' && '#inline-source-map',
    output: {
      path: path.resolve(outPath),
      filename: out,
      publicPath: '/'
    },
    entry: path.resolve(entry),
    mode,
    plugins
  }
}

module.exports = function(entry, output, options = {}) {
  const src = path.basename(entry)
  const srcPath = strip(entry, src)
  const out = path.basename(output)
  const outPath = strip(output, out)
  const include = [
    ...(options.include ? options.include : []),
    path.resolve(srcPath),
    path.resolve('node_modules/@codeurs')
  ]
  const context = {entry, output, src, srcPath, out, outPath, include}

  return (env, argv) => {
    const mode = argv.mode || process.env.NODE_ENV
    console.log(`Compiling for ${mode}`)
    const isProd = mode == 'production'
    const target = config({mode, ...context})
    const less = new ExtractTextPlugin({
      filename: path.parse(output).name + '.css',
      allChunks: true
    })
    return {
      ...target,
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(mode)
        }),
        new webpack.EnvironmentPlugin({
          DEBUG: 'false',
          SENTRY_CONNECTION: '',
          PROJECT_RELEASE: ''
        }),
        new webpack.ProvidePlugin({
          m: 'mithril'
        }),
        ...target.plugins,
        less
      ],
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
        extensions: ['.js', '.mjs', '.ts', '.tsx', '.less', '.css'],
        modules: [srcPath, 'node_modules']
      },
      module: {
        rules: [
          {
            test: /\.(ts|tsx)$/,
            include,
            use: 'happypack/loader?id=ts',
            sideEffects: false
          },
          {
            test: /\.js$/,
            include,
            use: 'happypack/loader?id=babel',
            sideEffects: false
          },
          {
            test: /\.mjs$/,
            type: 'javascript/auto'
          },
          {
            test: /\.font\.js$/,
            use: less.extract({
              use: ['css-loader', 'webfonts-loader']
            }),
            sideEffects: true
          },
          {
            test: /\.(css|less)$/,
            include,
            use: less.extract({
              use: [
                {
                  loader: 'css-loader',
                  options: {
                    sourceMap: !isProd
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: {
                    sourceMap: !isProd,
                    plugins: loader =>
                      []
                        .concat(
                          options.pxToRem
                            ? pxtorem({
                                propList: ['*'],
                                minPixelValue: 0
                              })
                            : []
                        )
                        .concat([
                          autoprefixer({grid: true}),
                          new IconfontWebpackPlugin(loader)
                        ])
                        .concat(isProd ? cssNano({preset: 'default'}) : [])
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
            }),
            sideEffects: true
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
            test: /\.(svg|jpg|png|gif)$/,
            include,
            use: {
              loader: 'sizeof-loader',
              options: {
                limit: 2048,
                name: 'assets/images/[name].[ext]'
              }
            }
          },
          {
            test: /\.(ico|webp|mp4|webm)$/,
            include,
            use: {
              loader: 'file-loader',
              options: {
                name: 'assets/data/[name].[ext]'
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
