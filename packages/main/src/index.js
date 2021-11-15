const { namespace, loadModule } = require('@dhis2/cli-helpers-engine')

const command = namespace('d2', {
    desc: 'DHIS2 CLI',
    builder: yargs => {
        const loader = loadModule({
            parentModule: __filename,
        })

        yargs.command(loader('@dhis2/cli-app'))
        yargs.command(loader('@dhis2/cli-cluster'))
        yargs.command(loader('@dhis2/cli-create'))
        yargs.command(loader('@dhis2/cli-style').command)
        yargs.command(loader('@dhis2/cli-utils'))
        yargs.commandDir('commands')
    },
})

module.exports = command
