const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('setup', {
    description: 'Handle setting up helper in apps',
    builder: yargs => yargs.commandDir('setup'),
})
