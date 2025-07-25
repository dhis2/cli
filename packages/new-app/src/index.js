const initCommand = require('@dhis2/cli-app-scripts/init')
const { reporter } = require('@dhis2/cli-helpers-engine')
const { groupGlobalOptions } = require('@dhis2/cli-helpers-engine')

const command = {
    command: '[app]',
    builder: yargs => {
        groupGlobalOptions(yargs)
    },
    handler: async argv => {
        reporter.debug('argv', argv)
        const name = argv._[0]

        if (!name) {
            reporter.error('name of project not provided')
            process.exit(1)
        }
        await initCommand.handler({ ...argv, pnpm: true, name })
    },
}

module.exports = command
