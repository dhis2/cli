const path = require('path')
const {
    namespace,
    findProjectRoot,
    reporter,
} = require('@dhis2/cli-helpers-engine')

function load(tool) {
    const root = findProjectRoot()
    const paths = root ? [path.resolve(root, 'node_modules')] : []

    try {
        const resolved = require.resolve(tool, {
            paths,
        })

        reporter.debug(`Loading tool from: ${resolved}`)
        return require(resolved)
    } catch (err) {
        reporter.debug(`Loading tool from: ${tool}`)
        return require(tool)
    }
}

const command = namespace('d2', {
    desc: 'DHIS2 CLI',
    builder: yargs => {
        yargs.command(load('@dhis2/cli-app'))
        yargs.command(load('@dhis2/cli-cluster'))
        yargs.command(load('@dhis2/cli-create'))
        yargs.command(load('@dhis2/cli-style').command)
        yargs.command(load('@dhis2/cli-utils'))
        yargs.commandDir('commands')
    },
})

module.exports = command
