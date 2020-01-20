import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import {
	Configuration,
	RuleSetRule,
	RuleSetUse,
	Plugin,
	Module,
	Resolve,
	EnvironmentPlugin,
	CliConfigOptions
} from 'webpack'
import path from 'path'
import ManifestPlugin from 'webpack-manifest-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import autoprefixer from 'autoprefixer'
import cssNano from 'cssnano'
import pxtorem from 'postcss-pxtorem'

type Mode = 'development' | 'production' | 'none'

export const merge = (a: Configuration, b: Configuration): Configuration => {
	return Object.assign(a, b, {
		plugins: (a.plugins ?? []).concat(b.plugins ?? []),
		module: {rules: (a.module?.rules ?? []).concat(b.module?.rules ?? [])}
	})
}

class Packer implements Configuration {
	module?: Module
	resolve?: Resolve

	constructor(config = {}) {
		Object.assign(this, config)
	}

	plugin(...plugins: Array<Plugin>) {
		return new Packer(merge(this, {plugins}))
	}

	loader(
		extensions: string | Array<string>,
		use: RuleSetUse,
		rest: Partial<RuleSetRule> = {}
	) {
		return new Packer(
			merge(this, {
				module: {
					rules: [
						{
							test: new RegExp(
								`\.(${
									typeof extensions === 'string'
										? extensions
										: extensions.join('|')
								})$`
							),
							use,
							...rest
						}
					]
				}
			})
		)
	}

	loaderWithSideEffects(
		extensions: string | Array<string>,
		use: RuleSetUse,
		rest: Partial<RuleSetRule> = {}
	) {
		return this.loader(extensions, use, {sideEffects: true, ...rest})
	}

	include(...paths: Array<string>) {
		const rules =
			this.module?.rules?.map(rule => ({
				...rule,
				include: paths.map(p => path.resolve(p))
			})) ?? []
		return new Packer(
			Object.assign({}, this, {
				module: {rules}
			})
		)
	}

	toConfig(): Configuration {
		return Object.assign({}, this)
	}
}

const stats = {
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
}

const postCssLoader = (isProd: boolean, options?: Options) => {
	return {
		loader: require.resolve('postcss-loader'),
		options: {
			sourceMap: !isProd,
			plugins: ([] as Array<any>)
				.concat(
					options?.pxToRem
						? pxtorem({
								propList: ['*'],
								minPixelValue: 2
						  })
						: []
				)
				.concat([autoprefixer({grid: 'autoplace'})])
				.concat(isProd ? cssNano({preset: 'default'}) : [])
		}
	}
}

export type Options = {
	pxToRem?: boolean
	preact?: boolean
}

type Env = string | Record<string, boolean | number | string>
type ArgV = CliConfigOptions

export const packer = (
	entry: string,
	output: string,
	options: Options = {}
) => (env: Env, argv: ArgV): Packer => {
	const src = path.parse(entry)
	const out = path.parse(output)
	//const info = require('package.json')
	const userMode: any = argv.mode || (typeof env !== 'string' && env.NODE_ENV)
	const mode: Mode = userMode || 'development'
	const isProd = mode == 'production'
	const suffix = mode === 'production' ? '.[hash:8]' : ''
	return new Packer({
		mode,
		stats,
		devtool: isProd ? 'source-map' : 'eval',
		entry: path.resolve(entry),
		output: {
			path: path.resolve(out.dir),
			filename: `${out.name}.js`,
			chunkFilename: `assets/[id].${out.name}${suffix}.js`,
			publicPath: '/'
		},
		resolve: {
			extensions: ['.js', '.mjs', '.ts', '.tsx', '.less', '.scss', '.sass'],
			modules: [src.dir, 'node_modules'],
			alias: options?.preact
				? {
						react: 'preact/compat',
						'react-dom': 'preact/compat'
				  }
				: {} // todo: load from package.json
		}
	})
		.plugin(
			new MiniCssExtractPlugin({
				filename: `${out.name}.css`,
				chunkFilename: `assets/[id].${out.name}${suffix}.css`
			})
		)
		.plugin(new ManifestPlugin())
		.plugin(new ForkTsCheckerWebpackPlugin())
		.plugin(
			new EnvironmentPlugin({
				NODE_ENV: 'development',
				DEBUG: 'false',
				SENTRY_CONNECTION: '',
				SENTRY_DSN: '',
				PROJECT_RELEASE: ''
			})
		)
		.loader('js', require.resolve('source-map-loader'), {enforce: 'pre'})
		.loader('ts|tsx', {
			loader: require.resolve('swc-loader'),
			options: {
				jsc: {
					parser: {
						syntax: 'typescript',
						tsx: true,
						decorators: true,
						dynamicImport: true
					}
				}
			}
		})
		.loaderWithSideEffects('less', [
			MiniCssExtractPlugin.loader,
			{
				loader: require.resolve('css-loader'),
				options: {
					sourceMap: !isProd
				}
			},
			postCssLoader(isProd, options),
			{
				loader: require.resolve('less-loader'),
				options: {
					sourceMap: !isProd,
					paths: [src.dir, 'node_modules']
				}
			}
		])
		.loaderWithSideEffects('scss|sass', [
			MiniCssExtractPlugin.loader,
			{
				loader: require.resolve('css-loader'),
				options: {
					sourceMap: !isProd
				}
			},
			postCssLoader(isProd, options),
			{
				loader: require.resolve('sass-loader'),
				options: {
					implementation: require('node-sass')
				}
			}
		])
		.loaderWithSideEffects('eot|ttf|woff|woff2', {
			loader: require.resolve('file-loader'),
			options: {name: `assets/fonts/[name]${suffix}.[ext]`}
		})
		.loaderWithSideEffects('ico|webp|mp4|webm', {
			loader: require.resolve('file-loader'),
			options: {name: `assets/fonts/[name]${suffix}.[ext]`}
		})
		.loaderWithSideEffects('svg|jpg|png|gif', {
			loader: require.resolve('sizeof-loader'),
			options: {
				useFileLoader: true,
				name: `assets/images/[name]${suffix}.[ext]`
			}
		})
		.loaderWithSideEffects('glsl|obj|html', require.resolve('raw-loader'))
		.include(src.dir, 'node_modules/@codeurs')
}

export default (entry: string, output: string, options: Options = {}) => {
	return (env: Env, argv: ArgV): Configuration =>
		packer(entry, output, options)(env, argv).toConfig()
}
