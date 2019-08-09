const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('schema', {
    desc: 'Utils for schema operations',
    builder: yargs =>
        yargs
            .option('force', {
                type: 'boolean',
                describe:
                    'By default each schema is cached, identified by the version and revision. Use this flag to disable caching and download the schemas.',
            })
            .option('auth', {
                type: 'boolean',
                default: false,
                describe: `Force prompt for credentials for each server. If false, credentials will be read from the config-file.`,
            })
            .commandDir('schema'),
})

module.exports = command
