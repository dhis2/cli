const test = require('tape')

const { makeEnvironment } = require('../src/common.js')

test('build runtime environment based on defaults', function(t) {
    t.plan(1)

    const argv = {
        name: 'dev',
    }
    const cache = {}
    const config = {}

    const actual = makeEnvironment(argv, cache, config)

    const expected = {
        DHIS2_CORE_NAME: 'dev',
        DHIS2_CORE_CONTEXT_PATH: '',
        DHIS2_CORE_IMAGE: 'dhis2/core:dev',
        DHIS2_CORE_VERSION: 'dev',
        DHIS2_CORE_DB_VERSION: 'dev',
        DHIS2_CORE_PORT: 8080,
    }

    t.deepEqual(actual, expected, 'default environment')
})
