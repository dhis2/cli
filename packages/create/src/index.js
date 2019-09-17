const path = require('path')
const chalk = require('chalk')
const { reporter } = require('@dhis2/cli-helpers-engine')
const { installTemplate } = require('@dhis2/cli-helpers-template')

const cliBuilder = require('./builders/cliBuilder')

const handler = async ({ type, name, ...argv }) => {
    if (!type) {
        reporter.print('USAGE: d2 create <type> [name]')
        reporter.error('Argument <type> is required')
        process.exit(1)
    }
    type = type.toLowerCase()
    switch (type) {
        case 'cli':
            reporter.info(`Creating CLI module in ${name}...`)
            const data = await cliBuilder({ name, ...argv })
            const dest = path.join(process.cwd(), data.basename)
            const src = path.join(__dirname, '../templates', type)

            reporter.debug(`Installing template ${chalk.bold(type)}`)
            reporter.debug('   src:', src)
            reporter.debug('  dest:', dest)
            reporter.debug('  data:  ', data)
            await installTemplate(src, dest, data)

            break
        case 'app':
            await require('./builders/app')({ name, ...argv })
            break
        default:
            reporter.error(`Unrecognized template ${type}`)
    }
}
const command = {
    command: 'create <type> [name]',
    desc: 'Create various DHIS2 components from templates',
    builder: yargs => {
        // yargs.positional('type', {
        //     describe: 'The type of thing to create',
        //     choices: ['cli', 'app'],
        //     type: 'string'
        // });
        // yargs.positional('name', {
        //     describe: 'The name of the directory in which to create the thing',
        //     type: 'string'
        // });
    },
    handler,
}

module.exports = command
