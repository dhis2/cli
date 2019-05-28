const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('cluster', {
    desc: 'Manage DHIS2 Docker clusters',
    aliases: 'c',
    builder: yargs =>
        yargs.commandDir('commands').parserConfiguration({
            'parse-numbers': false,
        }),
})

module.exports = command
