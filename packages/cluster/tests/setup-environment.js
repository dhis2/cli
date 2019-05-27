const test = require('tape')

const { makeEnvironment } = require('../src/common.js')

const defaults = require('../src/defaults.js')

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
        DHIS2_CORE_PORT: defaults.port,
    }

    t.deepEqual(actual, expected, 'default environment')
})

test('build runtime environment based on args', function(t) {
    t.plan(1)

    const argv = {
        name: 'dev',
        customContext: true,
        dhis2Version: '2.33',
        dbVersion: '2.32',
        channel: 'canary',
        variant: 'jetty-slackware',
        port: 8233,
    }
    const cache = {}
    const config = {}

    const actual = makeEnvironment(argv, cache, config)

    const expected = {
        DHIS2_CORE_NAME: 'dev',
        DHIS2_CORE_CONTEXT_PATH: '/dev',
        DHIS2_CORE_IMAGE: 'dhis2/core-canary:2.33-jetty-slackware',
        DHIS2_CORE_VERSION: '2.33',
        DHIS2_CORE_DB_VERSION: '2.32',
        DHIS2_CORE_PORT: 8233,
    }

    t.deepEqual(actual, expected, 'args environment')
})

test('build runtime environment based on mixed args and config', function(t) {
    t.plan(1)

    const argv = {
        name: 'mydev',
        customContext: true,
    }

    const cache = {}

    const config = {
        dhis2Version: 'master',
        port: 8233,
        channel: 'dev',
        dbVersion: 'dev',
    }

    const actual = makeEnvironment(argv, cache, config)

    const expected = {
        DHIS2_CORE_NAME: 'mydev',
        DHIS2_CORE_CONTEXT_PATH: '/mydev',
        DHIS2_CORE_IMAGE: 'dhis2/core-dev:master',
        DHIS2_CORE_VERSION: 'master',
        DHIS2_CORE_DB_VERSION: 'dev',
        DHIS2_CORE_PORT: 8233,
    }

    t.deepEqual(actual, expected, 'args and config environment')
})

test('build runtime environment based on mixed args, cache, config and defaults', function(t) {
    t.plan(1)

    const argv = {
        name: 'mydev',
    }

    const cache = {
        customContext: true,
        image: 'dhis2/core-canary:master-20190523-alpine',
    }

    const config = {
        port: 8233,
        dhis2Version: 'dev',
    }

    const actual = makeEnvironment(argv, cache, config)

    const expected = {
        DHIS2_CORE_NAME: 'mydev',
        DHIS2_CORE_CONTEXT_PATH: '/mydev',
        DHIS2_CORE_IMAGE: 'dhis2/core-canary:master-20190523-alpine',
        DHIS2_CORE_VERSION: 'dev',
        DHIS2_CORE_DB_VERSION: 'dev',
        DHIS2_CORE_PORT: 8233,
    }

    t.deepEqual(actual, expected, 'merged environment')
})
