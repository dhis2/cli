const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('utils', {
    desc: 'Utils for miscellaneous operations',
    builder: yargs => {
        yargs.command(require('@dhis2/cli-utils-cypress'))
        yargs.command(require('@dhis2/cli-utils-docsite'))
        yargs.commandDir('cmds')
    },
})

module.exports = command
