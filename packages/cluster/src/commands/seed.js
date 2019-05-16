const { reporter } = require('@dhis2/cli-helpers-engine')
const { initDockerComposeCache } = require('../common')
const { seed } = require('../db')

const run = async function({ ver, ...argv }) {
    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository: argv.cluster.dockerComposeRepository,
        force: false,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    const { cluster } = argv
    const resolvedVersion = ver ? ver : name

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
        ver: {
            desc: 'DB version to use',
            type: 'string',
            default: '',
        },
    },
    handler: run,
}
