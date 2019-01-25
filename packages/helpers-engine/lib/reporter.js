const chalk = require('chalk')
// const config = require("./ConfigLoader").config;
const util = require('util')

const config = {
    verbose: false,
    quiet: false,
}
const middleware = ({
    verboseOption = 'verbose',
    quietOption = 'quiet',
} = {}) => argv => {
    if (!!argv[verboseOption]) {
        config.verbose = true
    }
    if (!!argv[quietOption]) {
        config.quiet = true
    }
}

const levels = [
    {
        name: 'debug',
        verbose: true,
        stderr: true,
        msgEnhancer: msg =>
            `${chalk.bold.gray('[DEBUG]')} ${chalk.gray(msg)}\n`,
    },
    {
        name: 'debugErr',
        verbose: true,
        stderr: true,
        msgEnhancer: msg =>
            `${chalk.bold.red.dim('[DEBUG ERROR]')} ${chalk.red.dim(msg)}\n`,
    },
    {
        name: 'info',
        verbose: false,
        stderr: true,
        msgEnhancer: msg => `${chalk.cyan(msg)}\n`,
    },
    {
        name: 'dump',
        verbose: true,
        quiet: true,
        msgEnhancer: msg => chalk.gray(`${msg}`),
    },
    {
        name: 'pipe',
        verbose: false,
        quiet: true,
        msgEnhancer: msg => msg,
    },
    {
        name: 'pipeErr',
        verbose: false,
        quiet: true,
        stderr: true,
        msgEnhancer: msg => msg,
    },
    {
        name: 'dumpErr',
        verbose: true,
        stderr: true,
        msgEnhancer: msg => chalk.bgRed(`${msg}`),
    },
    {
        name: 'print',
        verbose: false,
        quiet: true,
        msgEnhancer: msg => `${msg}\n`,
    },
    {
        name: 'warn',
        verbose: false,
        stderr: true,
        msgEnhancer: msg =>
            `${chalk.bold.yellow('[WARNING]')} ${chalk.yellow(msg)}\n`,
    },
    {
        name: 'printErr',
        verbose: false,
        stderr: true,
        msgEnhancer: msg => `${msg}\n`,
    },
    {
        name: 'error',
        verbose: false,
        stderr: true,
        msgEnhancer: msg => `${chalk.bold.red('[ERROR]')} ${chalk.red(msg)}\n`,
    },
]

const shouldLog = lvl =>
    (!lvl.verbose || config.verbose !== false) && // If config.verbose is still undefined we shouldn't suppress logs
    (!config.quiet || lvl.quiet === true)

const write = (lvl = {}, msg, args) => {
    if (shouldLog(lvl)) {
        msg = `${msg} ${args.length ? util.format.apply(this, args) : ''}`
        if (lvl.msgEnhancer) {
            msg = lvl.msgEnhancer(msg)
        }
        if (args.length && msg.slice(-1) !== '\n') {
            msg += '\n'
        }
        if (lvl.stderr) {
            process.stderr.write(msg)
        } else {
            process.stdout.write(msg)
        }
    }
}
const reporter = {}

levels.forEach(lvl => {
    reporter[lvl.name] = (msg, ...args) => write(lvl, msg, args)
})

reporter.middleware = middleware

module.exports = reporter
