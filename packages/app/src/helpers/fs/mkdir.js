const { reporter } = require('@dhis2/cli-helpers-engine')
const fse = require('fs-extra')
const path = require('path')

const mkdir = (rootDir, dir) => {
    reporter.debug(`Adding folder: ${dir}`)
    fse.mkdirSync(path.join(rootDir, dir), { recursive: true })
}

module.exports = mkdir
