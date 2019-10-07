const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')
const execSync = require('./execSync')
const mkdir = require('./mkdir')
const write = require('./write')
const copy = require('./copy')
const { TEMPLATE_PATH } = require('./constants')

const copyTemplate = (fromName, toRootDir, toFilePath) =>
    copy({
        fromPath: TEMPLATE_PATH,
        fromName,
        toRootDir,
        toFilePath,
    })

/**
 * @param {string} rootDir
 */
const setupCucumber = rootDir => {
    reporter.debug('Installing cypress-cucumber-preprocessor node module')
    execSync(`cd ${rootDir} && yarn add -D cypress-cucumber-preprocessor`)

    mkdir(rootDir, 'cypress/integration/common')
    copyTemplate('cucumber-plugin.js', rootDir, 'cypress/plugins/index.js')
    copyTemplate('cypress_json_with_cucumber.json', rootDir, 'cypress.json')
    copyTemplate('support_login.js', rootDir, 'cypress/support/login.js')
    copyTemplate(
        'login_hook.js',
        rootDir,
        'cypress/integration/common/login.js'
    )
    write({
        rootDir,
        filePath: 'cypress/support/index.js',
        content: 'import "./login.js"',
    })

    const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), {
            enconding: 'utf8',
        })
    )

    const packageJsonWithScripts = {
        ...packageJson,
        'cypress-cucumber-preprocessor': {
            nonGlobalStepDefinitions: true,
        },
    }

    fs.writeFileSync(
        path.join(rootDir, 'package.json'),
        JSON.stringify(packageJsonWithScripts, null, 2)
    )
}

module.exports = setupCucumber
