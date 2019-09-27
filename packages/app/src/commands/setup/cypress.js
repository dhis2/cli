const { reporter } = require('@dhis2/cli-helpers-engine')
const setupCypress = require('../../helpers/setup/cypress/setupCypress')
const setupCucumber = require('../../helpers/setup/cypress/setupCucumber')
const setupTestFiles = require('../../helpers/setup/cypress/setupTestFiles')
const setupNpmScripts = require('../../helpers/setup/cypress/setupNpmScripts')

const builder = {
    noCypress: {
        describe: 'Do not setup cypress related packages, folders and files',
        type: 'boolean',
    },
    noCucumber: {
        describe: 'Do not setup cucumber related packages, folders and files',
        type: 'boolean',
    },
    noTestFiles: {
        describe: 'Setup sample files to test the setup',
        type: 'boolean',
    },
    noNpmScript: {
        describe: 'Do not setup npm script',
        type: 'boolean',
    },
}

const handler = args => {
    const rootDir = args.rootDir || process.cwd()

    if (!args.noCypress) {
        reporter.info('Setting up cypress')
        setupCypress(rootDir)
    }

    if (!args.noCucumber) {
        reporter.info('Setting up cucumber')
        setupCucumber(rootDir)
    }

    if (!args.noTestFiles) {
        reporter.info('Setting up test feature')
        setupTestFiles(rootDir)
    }

    if (!args.noNpmScript) {
        reporter.info('Setting up npm script')
        setupNpmScripts(rootDir)
    }
}

module.exports = {
    command: 'cnc [rootDir]',
    desc: 'Setup Cypress and Cucumber',
    handler,
    builder,
}
