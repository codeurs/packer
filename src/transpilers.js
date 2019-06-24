const babel = require('./babel')
const HappyPack = require('happypack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs')

const babelLoader = options => ({
  loader: 'babel-loader',
  options: babel(options)
})

module.exports = options => [
  new HappyPack({
    id: 'ts',
    verbose: false,
    threads: 4,
    loaders: [
      babelLoader(options),
      {
        loader: 'ts-loader',
        options: {happyPackMode: true}
      }
    ]
  }),
  new HappyPack({
    id: 'babel',
    verbose: false,
    threads: 4,
    loaders: [babelLoader(options)]
  }),
  new ForkTsCheckerWebpackPlugin({
    checkSyntacticErrors: true,
    tslint: fs.existsSync('tslint.json')
  })
]
