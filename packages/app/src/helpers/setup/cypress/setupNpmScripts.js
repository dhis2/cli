const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')
const execSync = require('./execSync')
const mkdir = require('./mkdir')
const copy = require('./copy')
const { TEMPLATE_PATH } = require('./constants')

const setupNpmScripts = rootDir => {
    const scriptTargetDir = path.join(`${rootDir}/scripts`)
    const scriptTargetDirExists = fs.existsSync(scriptTargetDir)

    if (!scriptTargetDirExists) {
        mkdir(rootDir, `scripts`)
    } else if (
        scriptTargetDirExists &&
        !fs.statSync(scriptTargetDir).isDirectory()
    ) {
        reporter.error(`${scriptTargetDir} exists but needs to be a directory`)
        process.exit(1)
    }

    copy({
        fromPath: TEMPLATE_PATH,
        fromName: 'cypress_run.js',
        toRootDir: rootDir,
        toFilePath: 'scripts/cypress_run.js',
    })
}

module.exports = setupNpmScripts
