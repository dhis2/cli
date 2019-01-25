const chalk = require('chalk')

const globalOptions = ['help', 'version', 'config']
module.exports = yargs => {
    yargs.group(globalOptions, chalk.bold('Global Options'))
}
