const { reporter } = require('@dhis2/cli-helpers-engine')
const fse = require('fs-extra')
const path = require('path')

const copy = ({ fromPath, fromName, toRootDir, toFilePath }) => {
    reporter.debug(`Copying "${fromName}" to "${toFilePath}"`)

    fse.copySync(
        path.join(fromPath, fromName),
        path.join(toRootDir, toFilePath)
    )
}

module.exports = copy
