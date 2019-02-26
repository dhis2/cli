const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('test', {
    description: 'Testing...',
    builder: yargs => yargs.commandDir('./commands'),
})
