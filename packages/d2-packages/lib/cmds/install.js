const path = require('path')
const spawn = require('child_process').spawn

const log = require('@vardevs/log')({
    level: require('../loglevel.js'),
    prefix: 'install',
})

const exec = require('./exec').handler

const die = require('../die.js')
const { bold } = require('../colors.js')
const getContext = require('../getContext')

exports.command = 'install'

exports.describe =
    'Run "install" command in each package, including root-level.'

exports.builder = {}

exports.handler = async function(argv) {
    const { is_monorepo, root_dir, tool } = await getContext()
    const newargv = Object.assign({}, argv, {
        command: tool,
        cmdargs: ['install'],
    })

    if (is_monorepo) {
        const print = (name, data) => {
            log.info(`[${name}]\n${data}`)
        }

        const error = (name, err) => {
            log.error(`[${name}]\n${err}`)
            die(`[${name}] error: ${err}`)
        }

        const close = (name, code) => {
            log.debug(`[${name}] "yarn install" exited with code: ${code}`)
            log.debug(`[${name}] proceed to run command in packages...`)
            exec(newargv)
        }

        const install = spawn(tool, ['install'], {
            cwd: root_dir,
            encoding: 'utf8',
        })

        const pkg_name = path.basename(root_dir)
        const name = bold(`${pkg_name}`)

        log.info(
            `[${name}] executing command "${tool} install" in root package...`
        )

        install.stdout.on('data', print.bind(this, name))

        install.stderr.on('data', print.bind(this, name))

        install.on('error', error.bind(this, name))

        install.on('close', close.bind(this, name))
    } else {
        exec(newargv)
    }
}
