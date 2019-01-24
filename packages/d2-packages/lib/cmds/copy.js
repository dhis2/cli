/** @format */

const path = require('path')
const fs = require('fs-extra')

const die = require('../die.js')

const log = require('@vardevs/log')({
    level: require('../loglevel.js'),
    prefix: 'copy',
})

const { collect } = require('@vardevs/io')
const { dep_graph } = require('../deps.js')

const getContext = require('../getContext')

exports.command = 'copy'

exports.describe = `Copies 'package.json' for packages from the base directory to the build directory.

When it copies the file it also manipulates the properties: 'publishConfig' and 'private'.

It adds the 'publishConfig' property so we can publish the package to our public @dhis2 organisation on NPM. This is the same as the command:

    npm publish --access public

The base 'package.json' file should have the private property set to 'true', and this command flips it to 'false' when writing the 'package.json' file to the 'build' directory.

This is to signify that we should publish from the build directory. If one accidentally tries to publish from the base directory, this property is a slight protection.
`

exports.builder = {}

exports.handler = async function() {
    const { cwd } = await getContext()
    const packages = collect(cwd, {
        blacklist: ['node_modules', '.git', 'src', 'build'],
        whitelist: ['package.json'],
    })

    const deps = dep_graph(packages)

    for (const pkg of deps) {
        const src_pkg = require(path.join(pkg.path, 'package.json'))

        const dist_pkg = JSON.stringify(
            {
                ...src_pkg,
                private: false,
                publishConfig: {
                    access: 'public',
                },
            },
            null,
            2
        )

        const target_pkg = path.join(pkg.path, 'build', 'package.json')
        const relative = path.relative(cwd, target_pkg)

        try {
            await fs.ensureFile(target_pkg)
            await fs.writeFile(target_pkg, dist_pkg, 'utf8')
            log.info(`wrote: ${relative}`)
        } catch (err) {
            log.error(`Could not write file "${relative}"`, err)
            die('Failed to write file')
        }
    }
}
