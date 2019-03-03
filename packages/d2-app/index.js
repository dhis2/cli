const { namespace } = require('@dhis2/cli-helpers-engine')
const createApp = require('@dhis2/create-app')

const appScripts = require('./src/scripts.js')
const release = require('./src/release.js')

module.exports = namespace('app', {
    desc: 'Manage DHIS2 applications',
    aliases: 'a',
    commands: [createApp, appScripts, release],
})
