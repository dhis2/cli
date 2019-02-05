const { generateCode, generateCodes } = require('dhis2-uid')

module.exports = {
    command: 'uid [limit]',
    desc: 'Generate DHIS2 UIDs',
    aliases: 'u',
    builder: {
        limit: {
            desc: 'Limit the amount of UIDs to generate',
            aliases: 'l',
            type: 'integer',
            default: 10,
        },

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
        const codes = generateCodes(argv.limit)

        if (argv.json) {
            console.log(JSON.stringify({ codes }, null, 4))
        } else if (argv.csv) {
            console.log('codes')

            for (let i = 0; i < argv.limit; i++) {
                console.log(generateCode())
            }
        } else {
            const chunk = 5

            for (let i = 0, j = codes.length; i < j; i += chunk) {
                const chunked = codes.slice(i, i + chunk)
                console.log(chunked.join(' '))
            }
        }
    },
}
