const babel = require('./babel')
const HappyPack = require('happypack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs')

const babelLoader = {
  loader: 'babel-loader',
  options: babel
}

module.exports = [
  new HappyPack({
    id: 'ts',
    verbose: false,
    threads: 4,
    loaders: [
      babelLoader,
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
    loaders: [babelLoader]
  }),
  new ForkTsCheckerWebpackPlugin({
    checkSyntacticErrors: true,
    tslint: fs.existsSync('tslint.json')
  })
]
