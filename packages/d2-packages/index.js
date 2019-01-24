const { namespace } = require('@dhis2/cli-utils')

const command = namespace('packages', {
    desc: 'Manage DHIS2 packages',
    aliases: 'pkg',
    builder: require('./lib/cmds'),
})

module.exports = command
