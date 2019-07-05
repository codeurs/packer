const transpilers = require('./transpilers')
const path = require('path')
const webpack = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const autoprefixer = require('autoprefixer')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const cssNano = require('cssnano')
const pxtorem = require('postcss-pxtorem')
const ManifestPlugin = require('webpack-manifest-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default

const strip = (str, end) => str.substr(0, str.length - end.length)

const config = context => {
	const {mode, entry, out, outPath, options, suffix} = context
	const isDev = mode !== 'production'
	const plugins = transpilers(options).concat([
		new ManifestPlugin(),
		new ImageminPlugin({
			disable: isDev,
			pngquant: {quality: '95-100'}
		})
	])
	if (process.env.ANALYZE)
		plugins.push(
			new BundleAnalyzerPlugin({
				analyzerHost: '0.0.0.0',
				analyzerPort: process.env.ANALYZE
			})
		)
	return {
		devtool: isDev ? '#inline-source-map' : 'source-map',
		output: {
			path: path.resolve(outPath),
			filename: `${out}.js`,
			chunkFilename: `assets/[id].${out}${suffix}.js`,
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
	const out = path.parse(output).name
	const outPath = strip(output, path.basename(output))
	const include = [
		...(options.include ? options.include : []),
		path.resolve(srcPath),
		path.resolve('node_modules/@codeurs')
	]
	const context = {entry, output, src, srcPath, out, outPath, include}

	return (env, argv) => {
		const mode = argv.mode || process.env.NODE_ENV
		const suffix = mode === 'production' ? '.[hash:8]' : ''
		const devServer = process.env.DEV_SERVER
		console.log(`Compiling for ${mode}`)
		const isProd = mode == 'production'
		const target = config({mode, options, suffix, ...context})
		const plugins = target.plugins
		const less = new MiniCssExtractPlugin({
			filename: `${out}.css`,
			chunkFilename: `assets/[id].${out}${suffix}.css`
		})
		const extract = loaders => {
			if (!devServer)
				return [{loader: MiniCssExtractPlugin.loader}].concat(loaders)
			return ['style-loader'].concat(loaders)
		}
		if (!devServer) plugins.push(less)
		const resolve = {
			symlinks: false,
			extensions: ['.js', '.mjs', '.ts', '.tsx', '.less', '.css'],
			modules: [srcPath, 'node_modules']
		}
		if (options.preact)
			resolve.alias = {
				react: 'preact/compat',
				'react-dom': 'preact/compat'
			}
		return {
			...target,
			plugins: [
				new webpack.DefinePlugin({
					'process.env.NODE_ENV': JSON.stringify(mode)
				}),
				new webpack.EnvironmentPlugin({
					DEBUG: 'false',
					SENTRY_CONNECTION: '',
					SENTRY_DSN: '',
					PROJECT_RELEASE: ''
				}),
				new webpack.ProvidePlugin({
					m: 'mithril'
				}),
				...plugins
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
			resolve,
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
						use: extract(['css-loader', 'webfonts-loader']),
						sideEffects: true
					},
					{
						test: /\.(css|less)$/,
						include,
						use: extract([
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
															minPixelValue: 2
													  })
													: []
											)
											.concat([autoprefixer({grid: true})])
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
						]),
						sideEffects: true
					},
					{
						test: /\.(eot|ttf|woff|woff2)$/,
						include,
						use: {
							loader: 'file-loader',
							options: {
								name: `assets/fonts/[name]${suffix}.[ext]`
							}
						},
						sideEffects: true
					},
					{
						test: /\.(svg|jpg|png|gif)$/,
						include,
						use: {
							loader: 'sizeof-loader',
							options: {
								useFileLoader: true,
								name: `assets/images/[name]${suffix}.[ext]`
							}
						},
						sideEffects: true
					},
					{
						test: /\.(ico|webp|mp4|webm)$/,
						include,
						use: {
							loader: 'file-loader',
							options: {
								name: `assets/data/[name]${suffix}.[ext]`
							}
						},
						sideEffects: true
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
