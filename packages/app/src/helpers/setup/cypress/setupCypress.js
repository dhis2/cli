const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')
const execSync = require('./execSync')
const mkdir = require('./mkdir')
const write = require('./write')

const setupCypress = rootDir => {
    reporter.debug('Installing cypress node module')
    execSync(`cd ${rootDir} && yarn add -D cypress`)

    mkdir(rootDir, 'cypress/fixtures')
    mkdir(rootDir, 'cypress/integration')
    mkdir(rootDir, 'cypress/support')
    mkdir(rootDir, 'cypress/plugins')

    write({ rootDir, filePath: `cypress/fixtures/.gitkeep` })
    write({ rootDir, filePath: `cypress/support/index.js` })
    write({ rootDir, filePath: `cypress/plugins/index.js` })
    write({ rootDir, filePath: `cypress.json` })
}

module.exports = setupCypress
