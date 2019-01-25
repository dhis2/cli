const chalk = require('chalk')

module.exports = {
    missingCommand: chalk.red(
        'You need at least one command before moving on.'
    ),
    unrecognizedCommand: chalk.red('Command not recognized...'),
}
