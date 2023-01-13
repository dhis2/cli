const { namespace, createModuleLoader } = require('@dhis2/cli-helpers-engine')

const command = namespace('utils', {
    desc: 'Utils for miscellaneous operations',
    builder: (yargs) => {
        const loader = createModuleLoader({
            parentModule: __filename,
        })

        yargs.command(loader('@dhis2/cli-utils-cypress'))
        yargs.command(loader('@dhis2/cli-utils-codemods'))
        yargs.command(loader('@dhis2/cli-utils-docsite'))
        yargs.commandDir('cmds')
    },
})

module.exports = command
