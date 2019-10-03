const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')

const write = ({ rootDir, filePath, content = '', options }) => {
    reporter.debug(`Writing to file: ${filePath}`)
    fs.writeFileSync(path.join(rootDir, filePath), content, options)
}

module.exports = write
