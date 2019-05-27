const { reporter } = require('@dhis2/cli-helpers-engine')
const {
    initClusterCache,
    initDockerComposeCache,
    makeEnvironment,
    resolveConfiguration,
    loadCache,
} = require('../common')
const { seed } = require('../db')

const defaults = require('../defaults')

const run = async function(argv) {
    const { cluster, dhis2Version, name, getCache } = argv

    const clusterCache = await initClusterCache(getCache(), name)
    const cache = loadCache(clusterCache)

    const {
        dockerComposeRepository,
        dockerComposeDirectory,
        dbVersion,
    } = resolveConfiguration(argv, {}, cluster)

    const cacheLocation = await initDockerComposeCache({
        composeProjectName: name,
        cache: getCache(),
        dockerComposeRepository,
        dockerComposeDirectory,
        force: false,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    return await seed({
        cacheLocation,
        dbVersion,
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
        dhis2Version: {
            desc: 'DHIS2 version to use',
            type: 'string',
        },
    },
    handler: run,
}
