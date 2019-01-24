const path = require('path')
const fs = require('fs-extra')

const die = require('./die.js')

const log = require('@vardevs/log')({
    level: require('./loglevel.js'),
    prefix: 'packages',
})
const { is_monorepo, mono_path } = require('./mono.js')

const repoDir = process.cwd()

async function tool(dir) {
    const yarnlock = path.join(dir, 'yarn.lock')
    try {
        await fs.access(yarnlock)
        log.debug('[setup] using "yarn"...')
        return 'yarn'
    } catch (err) {
        log.debug('[setup] using "npm"...')
        return 'npm'
    }
}

async function is_package(dir) {
    const pkg = path.join(dir, 'package.json')
    try {
        await fs.access(pkg)
        log.debug('[setup] "package.json" found...')
        return true
    } catch (err) {
        log.error('[setup] "package.json" not found!')
        die(`Could not find "package.json" in "${repoDir}".`)
    }
}

async function setup(cwd) {
    const monorepo = await is_monorepo(cwd)

    let pwd = cwd
    if (monorepo) {
        log.debug('[setup] monorepo detected...')
        pwd = mono_path(cwd)
    }

    return pwd
}

module.exports = async function getContext() {
    await is_package(repoDir)

    const npm_yarn = await tool(repoDir)
    const cwd = await setup(repoDir)

    return {
        cwd: cwd,
        is_monorepo: repoDir !== cwd,
        root_dir: repoDir,
        tool: npm_yarn,
    }
}
