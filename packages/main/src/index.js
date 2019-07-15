const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('d2', {
    desc: 'DHIS2 CLI',
    builder: yargs => {
        yargs.command(require('@dhis2/cli-app'))
        yargs.command(require('@dhis2/cli-cluster'))
        yargs.command(require('@dhis2/cli-create'))
        yargs.command(require('@dhis2/cli-style').command)
        yargs.command(require('@dhis2/cli-utils'))
        yargs.commandDir('commands')
    },
})

module.exports = command
