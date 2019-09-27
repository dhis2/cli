const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')
const mkdir = require('./mkdir')
const copy = require('./copy')
const { TEMPLATE_PATH } = require('./constants')

const TEST_FEATURE_CODE_FILE_PATH = path.join(TEMPLATE_PATH, 'Test.feature')
const TEST_STEPS_CODE_FILE_PATH = path.join(TEMPLATE_PATH, 'Test_steps.js')

const setupTestFiles = rootDir => {
    reporter.debug('Copying Test.feature file')

    mkdir(rootDir, 'cypress/integration/Test')
    copy({
        fromPath: TEMPLATE_PATH,
        fromName: 'Test.feature',
        toRootDir: rootDir,
        toFilePath: 'cypress/integration/Test.feature',
    })
    copy({
        fromPath: TEMPLATE_PATH,
        fromName: 'Test_steps.js',
        toRootDir: rootDir,
        toFilePath: 'cypress/integration/Test/index.js',
    })
}

module.exports = setupTestFiles
