const { makeDockerImage, substituteVersion } = require('../src/common.js')
const defaults = require('../src/defaults')

const template = defaults.image

test('replace {version} key with a value', function () {
    expect( substituteVersion('somethingwitha{version}key', '2.31.1') )
        .toEqual('somethingwitha2.31.1key', 'replace {version} with 2.31.1')
})

test('stable and 2.31.4', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: '2.31.4',
                channel: 'stable',
            },
        )
    ).toEqual('dhis2/core:2.31.4')

    expect(
        makeDockerImage(
            template,
            {
                version: '2.31.4',
            },
        )
    ).toEqual('dhis2/core:2.31.4')
})

test('stable and 2.32.0 with alpine variant', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: '2.32.0',
            },
            'alpine'
        )
    ).toEqual('dhis2/core:2.32.0-alpine');
})

test('stable and master with tomcat9 and debian-slim variant', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: 'master',
            },
            'tomcat9-debian-slim'
        )
    ).toEqual( 'dhis2/core:latest-tomcat9-debian-slim' )
})

test('stable and 2.32.0', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: '2.32.0',
                channel: 'stable',
            },
        )
    ).toEqual( 'dhis2/core:2.32.0')

    expect(
        makeDockerImage(
            template,
            {
                version: '2.32.0',
            },
        )
    ).toEqual( 'dhis2/core:2.32.0')
})

test('dev and master', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: 'master',
                channel: 'dev',
            },
        )
    ).toEqual( 'dhis2/core-dev:latest' )
})

test('dev and 2.32', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: '2.32',
                channel: 'dev',
            },
        )
    ).toEqual( 'dhis2/core-dev:2.32' )
})

test('canary and master', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: 'master',
                channel: 'canary',
            },
        )
    ).toEqual( 'dhis2/core-canary:latest' )
})

test('canary and 2.32', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: '2.32',
                channel: 'canary',
            },
        )
    ).toEqual( 'dhis2/core-canary:2.32' )
})

test('canary and 2.32 from date', function () {
    expect(
        makeDockerImage(
            template,
            {
                version: '2.32',
                channel: 'canary',
            },
            '20190523'
        )
    ).toEqual( 'dhis2/core-canary:2.32-20190523' )
})
