module.exports = {
  cacheDirectory: true,
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        loose: true,
        targets: {
          browsers: ['last 2 versions', 'ie >= 9', 'safari >= 7']
        }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-jsx',
    '@babel/plugin-transform-proto-to-assign',
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    '@babel/plugin-proposal-object-rest-spread',
    ['@babel/plugin-transform-react-jsx', {pragma: 'm'}],
    ['@babel/plugin-transform-runtime', {corejs: 2}]
  ]
}