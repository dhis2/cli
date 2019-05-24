const test = require('tape')

const { makeDockerImage, substituteVersion } = require('../src/common.js')

const defaults = require('../src/defaults')

const template = defaults.image

test('replace {version} key with a value', function(t) {
    t.plan(1)

    const string = 'somethingwitha{version}key'
    const version = '2.31.1'

    const result = substituteVersion(string, version)

    t.equal(result, 'somethingwitha2.31.1key', 'replace {version} with 2.31.1')
})

test('stable and 2.31.4', function(t) {
    t.plan(2)

    const expected = 'dhis2/core:2.31.4'

    t.equal(
        makeDockerImage(template, {
            version: '2.31.4',
            channel: 'stable',
        }),
        expected,
        expected
    )

    t.equal(
        makeDockerImage(template, {
            version: '2.31.4',
        }),
        expected,
        expected
    )
})

test('stable and 2.32.0 with alpine variant', function(t) {
    t.plan(1)

    const expected = 'dhis2/core:2.32.0-alpine'

    t.equal(
        makeDockerImage(
            template,
            {
                version: '2.32.0',
            },
            ['alpine']
        ),
        expected,
        expected
    )
})

test('stable and master with tomcat9 and debian-slim variant', function(t) {
    t.plan(1)

    const expected = 'dhis2/core:master-tomcat9-debian-slim'

    t.equal(
        makeDockerImage(
            template,
            {
                version: 'master',
            },
            ['tomcat9', 'debian-slim']
        ),
        expected,
        expected
    )
})

test('stable and 2.32.0', function(t) {
    t.plan(2)

    const expected = 'dhis2/core:2.32.0'

    t.equal(
        makeDockerImage(template, {
            version: '2.32.0',
            channel: 'stable',
        }),
        expected,
        expected
    )

    t.equal(
        makeDockerImage(template, {
            version: '2.32.0',
        }),
        expected,
        expected
    )
})

test('dev and master', function(t) {
    t.plan(1)

    const expected = 'dhis2/core-dev:master'

    t.equal(
        makeDockerImage(template, {
            version: 'master',
            channel: 'dev',
        }),
        expected,
        expected
    )
})

test('dev and 2.32', function(t) {
    t.plan(1)

    const expected = 'dhis2/core-dev:2.32'

    t.equal(
        makeDockerImage(template, {
            version: '2.32',
            channel: 'dev',
        }),
        expected,
        expected
    )
})

test('canary and master', function(t) {
    t.plan(1)

    const expected = 'dhis2/core-canary:master'

    t.equal(
        makeDockerImage(template, {
            version: 'master',
            channel: 'canary',
        }),
        expected,
        expected
    )
})

test('canary and 2.32', function(t) {
    t.plan(1)

    const expected = 'dhis2/core-canary:2.32'

    t.equal(
        makeDockerImage(template, {
            version: '2.32',
            channel: 'canary',
        }),
        expected,
        expected
    )
})

test('canary and 2.32 from date', function(t) {
    t.plan(1)

    const expected = 'dhis2/core-canary:2.32-20190523'

    t.equal(
        makeDockerImage(
            template,
            {
                version: '2.32',
                channel: 'canary',
            },
            ['20190523']
        ),
        expected,
        expected
    )
})
