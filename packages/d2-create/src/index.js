const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const cliBuilder = require('./builders/cliBuilder')
const installTemplate = require('./installTemplate')

const handler = async ({ type, name, ...argv }) => {
    // console.log(type, name, argv);
    if (!type) {
        reporter.print('USAGE: d2 create <type> [name]')
        reporter.error('Argument <type> is required')
        process.exit(1)
    }
    switch (type.toLowerCase()) {
        case 'cli':
            reporter.info(`Creating CLI module in ${name}...`)
            const data = await cliBuilder({ name, ...argv })
            const dest = path.join(process.cwd(), data.basename)
            await installTemplate('cli', dest, data)
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
