const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')

const mkdir = (rootDir, dir) => {
    reporter.debug(`Adding folder: ${dir}`)
    fs.mkdirSync(path.join(rootDir, dir), { recursive: true })
}

module.exports = mkdir
