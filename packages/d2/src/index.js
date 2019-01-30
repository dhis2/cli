const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('d2', {
    desc: 'DHIS2 CLI',
    builder: yargs => {
        yargs.commandDir('commands')
        yargs.command(require('@dhis2/cli-app'))
        yargs.command(require('@dhis2/cli-cluster'))
        yargs.command(require('@dhis2/cli-packages'))
        yargs.command(require('@dhis2/cli-style'))
    },
})

module.exports = command
