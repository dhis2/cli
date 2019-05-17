const { reporter } = require('@dhis2/cli-helpers-engine')
const { initDockerComposeCache } = require('../common')
const { seed } = require('../db')

const defaults = require('../defaults')

const run = async function({ dhis2Version, ...argv }) {
    const { cluster } = argv

    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository:
            cluster.dockerComposeRepository || defaults.dockerComposeRepository,
        force: false,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    const resolvedVersion = dhis2Version || name

    return await seed({
        cacheLocation,
        dbVersion: resolvedVersion,
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
            default: '',
        },
    },
    handler: run,
}
