const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('i18n', {
    description: 'Handle translations in apps',
    builder: yargs => yargs.commandDir('i18n'),
})
