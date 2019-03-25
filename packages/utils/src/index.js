const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('utils', {
    desc: 'Utils for miscellaneous operations',
    builder: yargs => {
        yargs.commandDir('cmds')
    },
})

module.exports = command
