const chalk = require('chalk')
const fs = require('fs')
const defaultConfig = require('./configDefaults')
const cacheMiddleware = require('./cache/middleware')
const reporter = require('./reporter')

module.exports = ({ desc, builder, handler }) => {
    const yargs = require('yargs') // singleton
    // TODO: Show description

    builder(yargs)

    // Define global options
    yargs
        .help()
        .alias('h', 'help')
        .version()

    // Configuration loading
    yargs
        .config(defaultConfig) // First, load defaults
        .config('config', file => {
            // Next, support configuration from a --config=<file> JSON file
            const r = JSON.parse(fs.readFileSync(file))
            return r
        })
        .env('D2') // D2_* environment variables get mapped to argv
        .pkgConf('d2') // Support d2 key in package.json

    yargs.updateStrings({
        'Options:': chalk.bold(`Options:`),
        'Commands:': chalk.bold('Commands:'),
        'Did you mean %s?': chalk.blue(`Did you mean ${chalk.bold('%s')}?`),
        'Not enough non-option arguments: got %s, need at least %s': chalk.red(
            'Missing required positional arguments (got %d of %d)'
        ),
    })

    // Support cache engine and reporter functionality
    yargs.middleware([cacheMiddleware({ name: 'd2' }), reporter.middleware()])

    // The actual business
    yargs.parse()

    if (handler) {
        handler(yargs.argv)
    }

    return yargs
}
