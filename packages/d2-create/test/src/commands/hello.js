const { reporter } = require('@dhis2/cli-helpers-engine')

const handler = async ({ name }) => {
    reporter.info(`Hello ${name || 'world'}!`)
}

module.exports = {
    command: 'hello [name]',
    desc: 'Say hello',
    aliases: 'h',
    handler,
}
