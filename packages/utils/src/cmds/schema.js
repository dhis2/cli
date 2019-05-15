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
                type: 'string',
                describe: `Auth to use, formatted as "user:password". Note that this is not safe, as password is shown in history.
            Use it as a flag (--auth, no args) to be prompted for credentials for each server.`,
            })
            .commandDir('schema'),
})

module.exports = command
