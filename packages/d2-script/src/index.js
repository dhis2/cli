const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('script', {
    desc: 'Scripts for miscellaneous operations',
    builder: yargs => {
        yargs.commandDir('commands')
    },
})

module.exports = command
