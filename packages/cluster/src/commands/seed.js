const { reporter } = require('@dhis2/cli-helpers-engine')
const {
    initClusterCache,
    initDockerComposeCache,
    makeEnvironment,
    resolveConfiguration,
} = require('../common')
const { seed } = require('../db')

const run = async function(argv) {
    const { name, getCache } = argv

    const cfg = await resolveConfiguration(argv)

    const cacheLocation = await initDockerComposeCache({
        composeProjectName: name,
        cache: getCache(),
        dockerComposeRepository: cfg.dockerComposeRepository,
        dockerComposeDirectory: cfg.dockerComposeDirectory,
        force: false,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    return await seed({
        cacheLocation,
        dbVersion: cfg.dbVersion,
        url: cfg.demoDatabaseURL,
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
        dbVersion: {
            desc: 'Version of the Database dump to use',
            type: 'string',
        },
    },
    handler: run,
}
