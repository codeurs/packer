const packer = require('./dist/index.js').default

module.exports = packer('test/example/index.tsx', 'build/index.js', {
	preact: true,
	svgAsReactComponent: true
})
