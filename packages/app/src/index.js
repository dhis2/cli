const { namespace, createModuleLoader } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('app', {
    description: 'Front-end application and library commands',
    builder: yargs => {
        const loader = createModuleLoader({
            parentModule: __filename,
        })

        yargs.command(loader('@dhis2/cli-app-scripts'))
        yargs.commandDir('commands')
    },
})
