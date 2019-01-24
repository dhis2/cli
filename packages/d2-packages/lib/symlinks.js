const log = require('@vardevs/log')({
    level: require('./loglevel.js'),
    prefix: 'symlink',
})

const path = require('path')
const fs = require('fs-extra')

const { bold } = require('./colors.js')

function find_pkg_dir(name, cwd) {
    let prefix = path.basename(cwd) + '-'

    const result = {
        scope: '',
        dir: '',
        name: name,
    }

    if (name.includes('/')) {
        const n = name.split('/')

        const scope = n.shift()
        const dir = n.shift().replace(prefix, '')

        result.scope = scope
        result.dir = dir
    }

    return result
}

function setup_symlinks(pkg, build_dir, cwd, pwd) {
    const res = find_pkg_dir(pkg.name, pwd)

    pkg.dependents.map(async x => {
        const { scope, dir, name } = find_pkg_dir(x, pwd)

        const target = path.join(cwd, dir, 'node_modules', pkg.name)

        try {
            log.debug(`setting up link from ${build_dir} to ${target}`)

            const exists = await fs.pathExists(target)
            if (exists) {
                log.debug(
                    `[${name}] target dir ${target} exists ... removing ...`
                )
                await fs.remove(target)
            }

            await fs.ensureSymlink(build_dir, target)
        } catch (e) {
            log.error(`[${name}] error linking from ${build_dir}}`)
        }

        log.info(`[${name}] link created to ${bold(build_dir)}`)
    })
}

module.exports = {
    setup_symlinks,
}
