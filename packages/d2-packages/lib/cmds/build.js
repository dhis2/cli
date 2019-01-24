const path = require('path')

const { dep_graph, sort, update } = require('../deps.js')
const { collect } = require('@vardevs/io')
const { bold } = require('../colors.js')

const die = require('../die.js')
const getContext = require('../getContext')

const log = require('@vardevs/log')({
    level: require('../loglevel.js'),
    prefix: 'build',
})

const spawn = require('child_process').spawnSync

exports.command = 'build'

exports.describe = `Executes the "build" script in the current repo.

This command is monorepo aware, so if there are multiple packages, it figures out dependencies between packages, and builds them in the required order.

This command does not need the packages to be linked, so useful in a CI environment.`

exports.builder = {}

exports.handler = async function() {
    // const { cwd, is_monorepo, root_dir, tool } = argv
    const { cwd, tool } = await getContext()
    const pkgs = collect(cwd, {
        blacklist: ['node_modules', '.git', 'src', 'build'],
        whitelist: ['package.json'],
    })

    const deps = dep_graph(pkgs)
    const candidates = sort(deps)

    for (const x of candidates) {
        try {
            const res = spawn(tool, ['run', 'build'], {
                cwd: x.path,
                encoding: 'utf8',
            })

            const status =
                res.status === 0
                    ? bold('OK')
                    : bold(`exit status ${res.status}`)

            log.info(`[${x.name}] build ${status}`)
            log.debug(`[${x.name}] stdout:\n${res.stdout}`)
            if (res.status !== 0) {
                const bcmd = bold(`${tool} run build`)
                log.error(`[${x.name}] failed to execute cmd: '${bcmd}'`)
                throw new Error(`${res.stderr}`)
            }
        } catch (e) {
            die(`[${x.name}] build command failed with message:\n\n${e}`)
        }
    }
    log.info('builds completed successfully')
}
