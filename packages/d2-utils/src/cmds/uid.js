const { generateCode, generateCodes } = require('dhis2-uid')
const log = require('@dhis2/cli-helpers-engine').reporter
const namespace = require('@dhis2/cli-helpers-engine').namespace

const generateCmd = {
    command: 'generate [limit]',
    aliases: ['g', 'gen'],
    describe: 'Generate DHIS2 UIDs',
    builder: {
        json: {
            desc: 'Output UIDs in JSON format',
            type: 'boolean',
        },

        csv: {
            desc: 'Output UIDs in CSV format',
            type: 'boolean',
        },
    },
    handler: argv => {
        const { limit } = argv

        const codes = generateCodes(limit || 10)

        if (argv.json) {
            log.print(JSON.stringify({ codes }, null, 4))
        } else if (argv.csv) {
            log.print('codes')

            for (let i = 0; i < argv.limit; i++) {
                log.print(generateCode())
            }
        } else {
            const chunk = 5

            for (let i = 0, j = codes.length; i < j; i += chunk) {
                const chunked = codes.slice(i, i + chunk)
                log.print(chunked.join(' '))
            }
        }
    },
}

module.exports = namespace('uid', {
    desc: 'DHIS2 UID tools',
    aliases: 'u',
    builder: yargs => {
        return yargs.command(generateCmd)
    },
})
