const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('debug', {
    desc: 'Debug local d2 installation',
    builder: (yargs) => yargs.commandDir('debug'),
})
