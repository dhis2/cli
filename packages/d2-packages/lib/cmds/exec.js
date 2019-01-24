/** @format */

const path = require('path')

const spawn = require('child_process').spawn

const { collect } = require('@vardevs/io')
const log = require('@vardevs/log')({
    level: require('../loglevel.js'),
    prefix: 'exec',
})

const die = require('../die.js')
const { bold } = require('../colors.js')
const getContext = require('../getContext')

exports.command = 'exec <command> [cmdargs..]'

exports.describe =
    'Runs the given <command> with [cmdargs..] on each package in the current dir'

exports.builder = {
    command: {
        string: true,
    },
    cmdargs: {
        array: true,
    },
}

exports.handler = async function(argv) {
    const { cmdargs, command } = argv
    const { cwd } = await getContext()

    const packages = collect(cwd, {
        blacklist: ['node_modules', '.git', 'src', 'build'],
        whitelist: ['package.json'],
    })

    const str_args = cmdargs.join(' ')

    const print = (name, data) => {
        log.info(`[${name}]\n${data}`)
    }

    const error = (name, err) => {
        log.error(`[${name}]\n${err}`)
        die(`[${name}] error: ${err}`)
    }

    const close = (name, code) => {
        log.debug(
            `[${name}] "${command} ${str_args}" exited with code: ${code}`
        )
    }

    for (const pkg of packages) {
        const exec = spawn(command, cmdargs, {
            cwd: path.dirname(pkg),
            encoding: 'utf8',
        })

        const pkg_name = path.basename(path.dirname(pkg))
        const name = bold(`${pkg_name}`)

        log.info(`[${name}] executing command "${command} ${str_args}"...`)

        exec.stdout.on('data', print.bind(this, name))

        exec.stderr.on('data', print.bind(this, name))

        exec.on('error', error.bind(this, name))

        exec.on('close', close.bind(this, name))
    }
}
