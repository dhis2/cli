const { reporter } = require('@dhis2/cli-helpers-engine')
const { initDockerComposeCache } = require('../common')
const { seed } = require('../db')

const run = async function(argv) {
    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository: argv.cluster.dockerComposeRepository,
        force: false,
    })
    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    return await seed({
        cacheLocation,
        ...argv,
    })
}

module.exports = {
    command: 'seed <name> [path]',
    desc: 'Seed the database from a backup',
    builder: {
        update: {
            alias: '-u',
            desc: 'Force re-download of cached files',
            type: 'boolean',
            default: false,
        },
        ver: {
            alias: '-v',
            desc: 'DB version to use',
            type: 'string',
            default: '',
        },
    },
    handler: run,
}
