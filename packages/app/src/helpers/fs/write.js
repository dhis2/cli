const { reporter } = require('@dhis2/cli-helpers-engine')
const fse = require('fs-extra')
const path = require('path')

const write = ({ rootDir, filePath, options, content = '', json = false }) => {
    const fileContent = json ? JSON.stringify(content, null, 2) : content

    reporter.debug(`Writing to file: ${filePath}`)
    fse.writeFileSync(path.join(rootDir, filePath), fileContent, options)
}

module.exports = write
