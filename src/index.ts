import autoprefixer from 'autoprefixer'
import cssNano from 'cssnano'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import {existsSync} from 'fs'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import path from 'path'
import pxtorem from 'postcss-pxtorem'
import {
	CliConfigOptions,
	Configuration,
	EnvironmentPlugin,
	Module,
	Plugin,
	Resolve,
	RuleSetRule,
	RuleSetUse,
	RuleSetConditions
} from 'webpack'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
import ManifestPlugin from 'webpack-manifest-plugin'
import {LiveReloadPlugin} from './livereloadplugin'

type Mode = 'development' | 'production' | 'none'

export const merge = (a: Configuration, b: Configuration): Configuration => {
	return Object.assign(a, b, {
		plugins: (a.plugins ?? []).concat(b.plugins ?? []),
		module: {rules: (a.module?.rules ?? []).concat(b.module?.rules ?? [])}
	})
}

class Packer implements Configuration {
	mode: Mode
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

	include(...paths: Array<string>) {
		const rules =
			this.module?.rules?.map(rule => ({
				...rule,
				include: ([] as RuleSetConditions)
					.concat(rule.include ?? [])
					.concat(paths.map(p => path.resolve(p)))
			})) ?? []
		return new Packer(
			Object.assign({}, this, {
				module: {rules}
			})
		)
	}

	set(config: Configuration) {
		return new Packer(merge(this, config))
	}

	toConfig(): Configuration {
		return Object.assign({}, this)
	}

	isProd() {
		return this.mode === 'production'
	}

	static from(env: Env, argv: ArgV) {
		const userMode: any = argv.mode || process.env.NODE_ENV
		const mode: Mode = userMode || 'development'
		const isProd = mode === 'production'
		const devtool = isProd ? 'source-map' : 'inline-source-map'
		return new Packer({mode, devtool})
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

const sizeOfLoader = (suffix: string) => ({
	loader: require.resolve('sizeof-loader'),
	options: {
		useFileLoader: true,
		name: `assets/images/[name]${suffix}.[ext]`
	}
})

const tsLoader = {
	loader: require.resolve('ts-loader'),
	options: {happyPackMode: true}
}

export type Options = {
	pxToRem?: boolean
	preact?: boolean
	svgAsReactComponent?: boolean
}

export type Context = {
	production: boolean
	suffix: string
}

type Env = string | Record<string, boolean | number | string>
type ArgV = CliConfigOptions

export const packer = (
	entry: string,
	output: string,
	options: Options = {}
) => (environment: Env, argv: ArgV): Packer => {
	const env = (name: string) =>
		environment && typeof environment !== 'string' && environment[name]
	let packer = Packer.from(environment, argv)
	const src = path.parse(entry)
	const out = path.parse(output)
	const isProd = packer.isProd()
	const suffix = isProd ? '.[hash:8]' : ''
	if (!isProd && env('reload')) {
		packer = packer.plugin(
			new LiveReloadPlugin({
				port: 0,
				appendScriptTag: true,
				quiet: true
			})
		)
	}
	if (env('analyze')) {
		packer = packer.plugin(
			new BundleAnalyzerPlugin({
				analyzerHost: '0.0.0.0',
				analyzerPort: env('analyze')
			})
		)
	}
	if (isProd) {
		packer = packer.plugin(new ManifestPlugin())
	}
	if (options?.svgAsReactComponent) {
		packer = packer.loader('svg', [
			require.resolve('@svgr/webpack'),
			{
				loader: require.resolve('file-loader'),
				options: {name: `assets/images/[name]${suffix}.[ext]`}
			}
		])
	}
	return packer
		.set({
			stats,
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
		.plugin(
			new ForkTsCheckerWebpackPlugin({
				checkSyntacticErrors: true,
				eslint: existsSync('.eslintrc.js')
			})
		)
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
		.loader('font.js', [
			MiniCssExtractPlugin.loader,
			require.resolve('css-loader'),
			require.resolve('webfonts-loader')
		])
		.loader(
			'js|ts|tsx',
			isProd
				? tsLoader
				: [
						require.resolve('cache-loader'),
						{
							loader: 'thread-loader',
							options: {
								workers: require('os').cpus().length - 1,
								poolTimeout: Infinity
							}
						},
						tsLoader
				  ]
		)
		.loader('less', [
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
		.loader('scss|sass', [
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
					implementation: require('sass')
				}
			}
		])
		.loader('eot|ttf|woff|woff2', {
			loader: require.resolve('file-loader'),
			options: {name: `assets/fonts/[name]${suffix}.[ext]`}
		})
		.loader('ico|webp|mp4|webm', {
			loader: require.resolve('file-loader'),
			options: {name: `assets/fonts/[name]${suffix}.[ext]`}
		})
		.loader('svg|jpg|png|gif', sizeOfLoader(suffix))
		.loader('glsl|obj|html', require.resolve('raw-loader'))
		.include(src.dir, 'node_modules/@codeurs')
}

export default (entry: string, output: string, options: Options = {}) => {
	return (env: Env, argv: ArgV): Configuration =>
		packer(entry, output, options)(env, argv).toConfig()
}
