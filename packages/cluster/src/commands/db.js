const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('db', {
    desc: 'Manage the database in a DHIS2 Docker cluster',
    builder: yargs =>
        yargs.commandDir('db_cmds').parserConfiguration({
            'parse-numbers': false,
        }),
})

module.exports = command
