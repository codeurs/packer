````javascript
packer(entry, bundle)
````

Returns a preconfigured webpack config with babel, less, image, fonts and font icon loaders

````javascript
// Use as your webpack.config.js file
const packer = require('@codeurs/packer')
module.exports = packer('src/index.js', 'dist/bundle.js')
// Outputs dist/bundle.js and dist/bundle.css
// Fonts go to dist/fonts/...
// Images to dist/assets/...
````