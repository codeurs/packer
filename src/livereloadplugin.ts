import md5 from 'md5'
import {debounce} from 'throttle-debounce'
import LiveReloadPlugin from 'webpack-livereload-plugin'

LiveReloadPlugin.prototype.apply = function apply(compiler) {
	this.compiler = compiler
	compiler.hooks.compilation.tap(
		'LiveReloadPlugin',
		this.applyCompilation.bind(this)
	)
	compiler.hooks.watchRun.tapAsync('LiveReloadPlugin', this.start.bind(this))
	const files = new Map<string, string>()
	let queued: Array<string> = []
	const notify = debounce(150, () => {
		this.server.notifyClients(queued)
		queued = []
	})
	compiler.hooks.assetEmitted.tap('LiveReloadPlugin', (file, buffer) => {
		const hash = md5('content' in buffer ? buffer.content : buffer)
		if (files.get(file) === hash) return
		files.set(file, hash)
		if (this.isRunning) {
			queued.push(file)
			notify()
		}
	})
}

export {LiveReloadPlugin}
