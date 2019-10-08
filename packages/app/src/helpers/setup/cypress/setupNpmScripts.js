const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const path = require('path')

const execSync = require('../../execSync')
const mkdir = require('../../fs/mkdir')
const copy = require('../../fs/copy')
const read = require('../../fs/read')
const write = require('../../fs/write')
const { TEMPLATE_PATH } = require('./constants')

const RUN_SCRIPT_PATH = path.join(TEMPLATE_PATH, 'cypress_run.js')
const RUN_FOLDER_PATH = path.join(TEMPLATE_PATH, 'cypress_run')

const createScriptTargetDir = rootDir => {
    reporter.debug('Creating scripts dir if not existing')

    const scriptTargetDir = path.join(rootDir, 'scripts')
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
}

const copyScripts = rootDir => {
    reporter.debug('Copying scripts to scripts folder')

    copy({
        from: RUN_SCRIPT_PATH,
        rootDir,
        toFilePath: 'scripts/cypress_run.js',
    })

    copy({
        from: RUN_FOLDER_PATH,
        rootDir,
        toFilePath: 'scripts/cypress_run',
    })
}

const addPackageJsonEntry = rootDir => {
    reporter.debug('Adding cypress commands to package.json')

    const packageJson = read('package.json', { json: true, rootDir })

    const packageJsonWithScripts = {
        ...packageJson,
        scripts: {
            ...packageJson.scripts,
            'cypress:open': 'cypress open',
            'cypress:start': 'node scripts/cypress_run.js',
        },
    }

    write({
        rootDir,
        filePath: 'package.json',
        json: true,
        content: packageJsonWithScripts,
    })
}

const setupNpmScripts = rootDir => {
    createScriptTargetDir(rootDir)
    copyScripts(rootDir)
    addPackageJsonEntry(rootDir)
}

module.exports = setupNpmScripts
