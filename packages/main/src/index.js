const {
    namespace,
    createModuleLoader,
    chalk,
} = require('@dhis2/cli-helpers-engine')

const command = namespace('d2', {
    desc: 'DHIS2 CLI',
    builder: yargs => {
        const loader = createModuleLoader({
            parentModule: __filename,
        })

        console.log(
            `\nTo create new web apps, you can now use ${chalk.cyan(
                'npm create @dhis2@alpha'
            )} instead of ${chalk.bold(
                'd2 app scripts init'
            )} for more options.\n`
        )

        yargs.command(loader('@dhis2/cli-app'))
        yargs.command(loader('@dhis2/cli-cluster'))
        yargs.command(loader('@dhis2/cli-create'))
        yargs.command(loader('@dhis2/cli-style').command)
        yargs.command(loader('@dhis2/cli-utils'))
        yargs.commandDir('commands')
    },
})

module.exports = command
