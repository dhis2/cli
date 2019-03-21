const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('app', {
    description: '',
    builder: yargs => yargs.commandDir('./commands'),
})
