const { dockerImageUsingJib } = require('../src/common.js')

test.each([
    'master',
    '2.39',
    '2.39.0',
    '2.39.0.1',
    '2.38.2',
    '2.38.2.0',
    '2.38.2.1',
    '2.37.9',
])('Docker image for DHIS2 %s contains /opt/dhis2', function (version) {
    expect(dockerImageUsingJib(version)).toBeTruthy()
})

test.each([
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
])('Docker image for DHIS2 %s contains /DHIS2_home', function (version) {
    expect(dockerImageUsingJib(version)).toBeFalsy()
})

test.each([
    '',
    '   ',
    '2',
    '2.'
])(`'%s' is an invalid version`, function (version) {
        expect(
            function () {
                dockerImageUsingJib(version)
            })
        .toThrow(/^invalid version format/i)
})
