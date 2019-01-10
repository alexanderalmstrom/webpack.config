const path = require('path')
const fs = require('fs')

function RevPlugin (options) {
  this.options = options
}

RevPlugin.prototype.apply = function (compiler) {
  const options = this.options

  if (!options.manifest)
    throw new Error('No manifest specified in RevPlugin')

  if (!options.files.length)
    throw new Error('No files specified in RevPlugin')

  compiler.plugin('done', function (stats) {
    const replacer = function (filePath, from, to) {
      const replace = function (match) {
        return to
      }

      const str = fs.readFileSync(filePath, 'utf8'),
            out = str.replace(new RegExp(from, 'g'), replace)

      fs.writeFileSync(filePath, out)
    }

    const manifestFile = JSON.parse(fs.readFileSync(options.manifest, 'utf8'))

    if (!manifestFile)
      throw new Error('manifest.json could not be found')

    for (let fileKey in options.files) {
      const filePath = options.files[fileKey]

      for (let assetKey in manifestFile) {
        const assetPath = manifestFile[assetKey]
  
        replacer(filePath, assetKey, assetPath)
      }
    }
  })
}

module.exports = RevPlugin