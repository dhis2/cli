const test = require('tape-await')
const { dockerImageUsingJib } = require('../src/common.js')

test(`DHIS2 versions with Docker image containing /opt/dhis2`, async function (t) {
    const versions = [
        'master',
        '2.39',
        '2.39.0',
        '2.39.0.1',
        '2.38.2',
        '2.38.2.0',
        '2.38.2.1',
        '2.37.9',
        '2.37.8.2',
    ]
    t.plan(versions.length)

    versions.forEach(version => t.ok(dockerImageUsingJib(version), version))
})

test('DHIS2 versions with Docker image built containing /DHIS2_home', async function (t) {
    const versions = [
        '2.38',
        '2.38.1.1',
        '2.37.8.1',
        '2.37.8',
        '2.37',
        '2.37.7.1',
        '2.36.13.1',
        '2.36.3',
        '2.35.14',
        '2.34.0',
        '2.33',
    ]
    t.plan(versions.length)

    versions.forEach(version => t.notOk(dockerImageUsingJib(version), version))
})

test('throws given invalid version', async function (t) {
    const versions = ['', '   ', '2', '2.']
    t.plan(versions.length)

    versions.forEach(version =>
        t.throws(
            function () {
                dockerImageUsingJib(version)
            },
            /^Error: invalid version format/i,
            version
        )
    )
})
