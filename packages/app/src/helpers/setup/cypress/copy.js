const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')

const copy = ({ fromPath, fromName, toRootDir, toFilePath }) => {
    reporter.debug(`Copying "${fromName}" to "${toFilePath}"`)

    fs.copyFileSync(
        path.join(fromPath, fromName),
        path.join(toRootDir, toFilePath)
    )
}

module.exports = copy
