/** @format */

const cmds = require('./cmds.js')

const log = require('@vardevs/log')({
    level: require('./loglevel.js'),
    prefix: 'help',
})

const { bold } = require('./colors.js')

module.exports = function(args) {
    if (args.length === 0) {
        log.info('')
        log.info('usage: help COMMAND')
        log.info('')
        log.info(`${bold('Available commands are:')}`)

        cmds.list.map(x => log.info(`\t- ${x}`))
    } else {
        const cmd = args.shift()
        const doc = cmds[cmd].doc
        log.info('')
        log.info(`\n
${bold(cmd)}
${bold(''.padStart(cmd.length, '-'))}\n
${doc}`)
    }
}
