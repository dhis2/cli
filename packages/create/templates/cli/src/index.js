const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('{{{basename}}}', {
    description: '{{{description}}}',
    builder: (yargs) => yargs.commandDir('./commands'),
})
