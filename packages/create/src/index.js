const initCommand = require('@dhis2/cli-app-scripts/init')
const { reporter } = require('@dhis2/cli-helpers-engine')
const { input, select } = require('@inquirer/prompts')

process.on('uncaughtException', (error) => {
    if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log('👋 until next time!')
    } else {
        // Rethrow unknown errors
        throw error
    }
})

const commandHandler = {
    command: '*', // default command
}

const command = {
    command: '[app]',
    builder: (yargs) => {
        yargs.command(commandHandler)
    },
    handler: async (argv) => {
        let name = argv._[0] || argv.name

        reporter.debug(
            `running "npm create @dhis2" (or npx) command which is an alias to "d2 app scripts init"`
        )
        const interactive = argv.i || argv.interactive

        if (!name) {
            name = await input({
                type: 'input',
                name: 'name',
                message: 'What is the name of the project?',
                required: true,
            })
            reporter.log(`name of project: ${name}`)
        }

        let pnpm = true
        let npm = false
        let typeScript = false
        if (interactive) {
            const packageManager = await select({
                message: 'Select a package manager',
                default: 'pnpm',
                choices: [
                    { name: 'npm', value: 'npm' },
                    { name: 'pnpm', value: 'pnpm' },
                    { name: 'yarn 1 (legacy)', value: 'yarn' },
                ],
            })

            pnpm = packageManager === 'pnpm'
            npm = packageManager === 'npm'

            const template = await select({
                message: 'Select a template',
                default: 'js',
                choices: [
                    { name: 'JavaScript', value: 'js' },
                    { name: 'TypeScript', value: 'ts' },
                    {
                        name: 'Custom (coming soon)',
                        disabled: true,
                        value: 'custom',
                    },
                ],
            })

            typeScript = template === 'ts'
        }

        await initCommand.handler({
            ...argv,
            pnpm,
            npm,
            typeScript,
            name,
        })
    },
}

module.exports = command
