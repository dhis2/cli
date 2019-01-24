/** @format */

const path = require('path')
const { spawn } = require('child_process')
const getContext = require('../getContext')

const log = require('@vardevs/log')({
    level: require('../loglevel.js'),
    prefix: 'link',
})

const { collect } = require('@vardevs/io')

const die = require('../die.js')
const { dep_graph } = require('../deps.js')

const copy_package_json = require('./copy.js').handler

const { bold } = require('../colors.js')

const { setup_symlinks } = require('../symlinks.js')

function complete(max = 0, pkgs = [], cmd) {
    let total = max
    let deps = pkgs
    let count = 0
    let tool = cmd

    log.debug(`Counting to ${total}`)

    return _ => {
        count++
        log.info(`linking: ${count}/${total} links created...`)

        if (count === total) {
            for (const pkg of deps) {
                pkg.depends.map(x => link_use(pkg.path, x, tool))
            }
        }
    }
}

exports.command = 'link'

exports.describe = `Sets up inter-dependencies using symlinks.

The link command attempts to figure out which packages need links to which other packages which are inside of the base dir.`

exports.builder = {}

exports.handler = async function(argv) {
    const { cwd, is_monorepo, root_dir, tool } = await getContext()
    await copy_package_json(argv)

    const pkgs = collect(cwd, {
        blacklist: ['node_modules', '.git', 'src', 'build'],
        whitelist: ['package.json'],
    })

    const deps = dep_graph(pkgs)

    const total_pkgs = deps.length
    const counter = complete(total_pkgs, deps, tool)

    for (const pkg of deps) {
        const pkg_dir = pkg.path
        const build_dir = path.join(pkg_dir, 'build')

        setup_symlinks(pkg, build_dir, cwd, root_dir)
    }
}
