const { reporter } = require('@dhis2/cli-helpers-engine')
const fse = require('fs-extra')
const path = require('path')

const copy = ({ from, rootDir, toFilePath }) => {
    const to = path.join(rootDir, toFilePath)
    const baseName = path.basename(from)

    reporter.debug(`Copying "${baseName}" to "${toFilePath}"`)
    fse.copySync(from, to)
}

module.exports = copy
