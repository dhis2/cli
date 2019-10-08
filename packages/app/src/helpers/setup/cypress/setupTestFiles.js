const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')

const mkdir = require('../../fs/mkdir')
const copy = require('../../fs/copy')
const { TEMPLATE_PATH } = require('./constants')

const TEST_FEATURE_PATH = path.join(TEMPLATE_PATH, 'Test.feature')
const TEST_STEPS_PATH = path.join(TEMPLATE_PATH, 'Test_steps.js')

const setupTestFiles = rootDir => {
    reporter.debug('Copying Test.feature file')

    mkdir(rootDir, 'cypress/integration/Test')

    copy({
        from: TEST_FEATURE_PATH,
        rootDir,
        toFilePath: 'cypress/integration/Test.feature',
    })

    copy({
        from: TEST_STEPS_PATH,
        rootDir,
        toFilePath: 'cypress/integration/Test/index.js',
    })
}

module.exports = setupTestFiles
