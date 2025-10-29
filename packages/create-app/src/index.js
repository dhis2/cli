const initCommand = require('@dhis2/cli-app-scripts/init')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
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
            `running "npm create @dhis2/app" (or npx) command which is an alias to "d2 app scripts init"`
        )
        const useDefauls = argv.yes

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
        let typeScript = argv.typescript || true
        if (!useDefauls) {
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
                default: 'ts',
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

        if (useDefauls) {
            reporter.info(
                chalk.greenBright(
                    `These default options will be used to create a new app: \n${chalk.greenBright(
                        '- Language: TypeScript\n- Package manager: pnpm'
                    )}`
                )
            )
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
