const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('schema', {
    desc: 'Utils for schema operations',
    builder: yargs => yargs.commandDir('schema'),
})

module.exports = command
