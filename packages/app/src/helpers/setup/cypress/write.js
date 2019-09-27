const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')

const write = (rootDir, filePath, content = '') => {
    reporter.debug(`Writing to file: ${filePath}`)
    fs.writeFileSync(path.join(rootDir, filePath), content)
}

module.exports = write
