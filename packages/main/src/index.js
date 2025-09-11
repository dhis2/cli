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


        if (!yargs.argv._?.[0]) {
            console.log(
                chalk.yellowBright(
                    `Check the D2 CLI documentation: ${chalk.underline(
                        'https://developers.dhis2.org/docs/cli'
                    )}. To create new web apps, you can also now run ${chalk.cyan(
                        'npm create @dhis2@alpha'
                    )} or ${chalk.cyan('npx @dhis2/create@alpha')}.\n`
                )
            )
        }

        yargs.command(loader('@dhis2/cli-app'))
        yargs.command(loader('@dhis2/cli-cluster'))
        yargs.command(loader('@dhis2/cli-create'))
        yargs.command(loader('@dhis2/cli-style').command)
        yargs.command(loader('@dhis2/cli-utils'))
        yargs.commandDir('commands')
    },
})

module.exports = command
