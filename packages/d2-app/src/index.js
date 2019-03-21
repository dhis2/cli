const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('app', {
    description: 'Front-end application and library commands',
    builder: yargs => yargs.commandDir('./commands'),
})
