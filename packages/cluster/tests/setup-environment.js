const test = require('tape-await')

const { makeEnvironment, resolveConfiguration } = require('../src/common.js')

const defaults = require('../src/defaults.js')

const cache = obj => ({
    read: () => JSON.stringify(obj),
    write: () => {},
})

test('build runtime environment based on defaults', async function(t) {
    t.plan(1)

    const argv = {
        name: 'dev',
        getCache: () => cache(null),
    }

    const cfg = await resolveConfiguration(argv)
    const actual = makeEnvironment(cfg)

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

test('build runtime environment based on args', async function(t) {
    t.plan(1)

    const argv = {
        name: 'dev',
        customContext: true,
        dhis2Version: '2.33',
        dbVersion: '2.32',
        channel: 'canary',
        variant: 'jetty-slackware',
        port: 8233,
        getCache: () => cache(null),
    }

    const cfg = await resolveConfiguration(argv)
    const actual = makeEnvironment(cfg)

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

test('build runtime environment based on mixed args and config', async function(t) {
    t.plan(1)

    const config = {
        dhis2Version: 'master',
        port: 8233,
        channel: 'dev',
        dbVersion: 'dev',
    }

    const argv = {
        name: 'mydev',
        customContext: true,
        cluster: config,
        getCache: () => cache(null),
    }

    const cfg = await resolveConfiguration(argv)
    const actual = makeEnvironment(cfg)

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

test('build runtime environment based on mixed args, cache, config and defaults', async function(t) {
    t.plan(1)

    const config = {
        port: 8233,
        dhis2Version: 'dev',
    }

    const argv = {
        name: 'mydev',
        cluster: config,
        getCache: () =>
            cache({
                customContext: true,
                image: 'dhis2/core-canary:master-20190523-alpine',
            }),
    }

    const cfg = await resolveConfiguration(argv)
    const actual = makeEnvironment(cfg)

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

test('build runtime environment based on mixed args, cache, config, custom per-cluster config and defaults', async function(t) {
    t.plan(1)

    const config = {
        port: 8233,
        dhis2Version: 'dev',
        dbVersion: 'dev',
        clusters: {
            '2330': {
                port: 9999,
                dhis2Version: 'apa',
            },
        },
    }

    const argv = {
        name: '2330',
        cluster: config,
        getCache: () =>
            cache({
                customContext: true,
                image: 'dhis2/core-canary:master-20190523-alpine',
            }),
    }

    const cfg = await resolveConfiguration(argv)
    const actual = makeEnvironment(cfg)

    const expected = {
        DHIS2_CORE_NAME: '2330',
        DHIS2_CORE_CONTEXT_PATH: '/2330',
        DHIS2_CORE_IMAGE: 'dhis2/core-canary:master-20190523-alpine',
        DHIS2_CORE_VERSION: 'apa',
        DHIS2_CORE_DB_VERSION: 'dev',
        DHIS2_CORE_PORT: 9999,
    }

    t.deepEqual(actual, expected, 'merged environment')
})
