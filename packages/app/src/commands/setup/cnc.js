const { reporter } = require('@dhis2/cli-helpers-engine')
const setupCypress = require('../../helpers/setup/cypress/setupCypress')
const setupCucumber = require('../../helpers/setup/cypress/setupCucumber')
const setupTestFiles = require('../../helpers/setup/cypress/setupTestFiles')
const setupNpmScripts = require('../../helpers/setup/cypress/setupNpmScripts')
const extendGitIgnore = require('../../helpers/setup/cypress/extendGitIgnore')

const builder = {
    ignoreCypress: {
        describe: 'Do not setup cypress related packages, folders and files',
        type: 'boolean',
    },
    ignoreCucumber: {
        describe: 'Do not setup cucumber related packages, folders and files',
        type: 'boolean',
    },
    ignoreTestFiles: {
        describe: 'Setup sample files to test the setup',
        type: 'boolean',
    },
    ignoreNpmScript: {
        describe: 'Do not setup npm script',
        type: 'boolean',
    },
    ignoreGitignore: {
        describe: 'Do not write/append to .gitignore',
        type: 'boolean',
    },
}

const handler = args => {
    const rootDir = args.rootDir || process.cwd()
    const { verbose } = args

    if (!args.ignoreCypress) {
        reporter.info('Setting up cypress')
        setupCypress(rootDir, verbose)
    }

    if (!args.ignoreCucumber) {
        reporter.info('Setting up cucumber')
        setupCucumber(rootDir, verbose)
    }

    if (!args.ignoreTestFiles) {
        reporter.info('Setting up test feature')
        setupTestFiles(rootDir)
    }

    if (!args.ignoreNpmScript) {
        reporter.info('Setting up npm script')
        setupNpmScripts(rootDir)
    }

    if (!args.ignoreGitignore) {
        reporter.info('Adding entries to .gitignore')
        extendGitIgnore(rootDir)
    }
}

module.exports = {
    command: 'cnc [rootDir]',
    desc: 'Setup Cypress and Cucumber',
    handler,
    builder,
}
