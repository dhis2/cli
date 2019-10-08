const { reporter } = require('@dhis2/cli-helpers-engine')
const fse = require('fs-extra')
const path = require('path')

const execSync = require('../../execSync')
const mkdir = require('../../fs/mkdir')
const read = require('../../fs/read')
const write = require('../../fs/write')
const copy = require('../../fs/copy')
const { TEMPLATE_PATH } = require('./constants')

/**
 * @param {string} rootDir
 */
const addPackageJsonEntry = rootDir => {
    const packageJson = read('package.json', { json: true, rootDir })

    const packageJsonWithScripts = {
        ...packageJson,
        'cypress-cucumber-preprocessor': {
            nonGlobalStepDefinitions: true,
        },
    }

    write({
        rootDir,
        filePath: 'package.json',
        content: packageJsonWithScripts,
        json: true,
    })
}

/**
 * @param {string} rootDir
 * @param {bool} verbose
 */
const setupCucumber = (rootDir, verbose) => {
    reporter.debug('Installing cypress-cucumber-preprocessor node module')
    execSync(
        `cd ${rootDir} && yarn add -D cypress-cucumber-preprocessor`,
        verbose
    )

    mkdir(rootDir, 'cypress/integration/common')

    copy({
        from: path.join(TEMPLATE_PATH, 'cucumber-plugin.js'),
        rootDir,
        toFilePath: 'cypress/plugins/index.js',
    })

    copy({
        from: path.join(TEMPLATE_PATH, 'cypress_json_with_cucumber.json'),
        rootDir,
        toFilePath: 'cypress.json',
    })

    copy({
        from: path.join(TEMPLATE_PATH, 'support_login.js'),
        rootDir,
        toFilePath: 'cypress/support/login.js',
    })

    copy({
        from: path.join(TEMPLATE_PATH, 'login_hook.js'),
        rootDir,
        toFilePath: 'cypress/integration/common/login.js',
    })

    write({
        rootDir,
        filePath: 'cypress/support/index.js',
        content: 'import "./login.js"',
    })

    addPackageJsonEntry(rootDir)
}

module.exports = setupCucumber
