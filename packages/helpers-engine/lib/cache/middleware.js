const Cache = require('.')
const yargs = require('yargs')

module.exports = ({ name, option = 'cache' }) => argv => {
    let theCache
    if (argv[option]) {
        theCache = new Cache({ cacheRoot: argv[option] })
    } else {
        theCache = new Cache({ name: name || yargs.scriptName() })
    }
    argv.getCache = () => theCache
    return argv
}
