import webpack from 'webpack'
import packer from '../src/index'

const config = packer(__dirname + '/example/index.tsx', './build/index.js', {
	svgAsReactComponent: true
})
const test = config('', {})

webpack(test, (err, stats) => {
	if (err || stats.hasErrors()) {
		console.error(err || stats.compilation.errors)
		process.exit(1)
	} else {
		process.exit(0)
	}
})
