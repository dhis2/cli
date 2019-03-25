const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('scripts', {
    desc: 'DHIS2 CLI',
    builder: yargs => {
        yargs.commandDir('scripts')
    },
})

module.exports = command
