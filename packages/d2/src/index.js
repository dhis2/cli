const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('d2', {
    desc: 'DHIS2 CLI',
    builder: yargs => {
        yargs.commandDir('commands')
        yargs.command(require('@dhis2/cli-cluster'))
        yargs.command(require('@dhis2/cli-create'))
        yargs.command(require('@dhis2/cli-style'))
        yargs.command(require('@dhis2/cli-utils'))
        yargs.command(require('@dhis2/cli-app'))
    },
})

module.exports = command
