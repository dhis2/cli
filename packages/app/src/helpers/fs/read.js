const fse = require('fs-extra')
const path = require('path')

const read = (filePath, { json = false, rootDir = '' }) => {
    const realPath = path.join(rootDir, filePath)
    const content = fse.readFileSync(realPath, { encoding: 'utf8' })

    if (json) {
        return JSON.parse(content)
    }

    return content
}

module.exports = read
