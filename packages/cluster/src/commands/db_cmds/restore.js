const { reporter, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const { initDockerComposeCache, resolveConfiguration } = require('../../common')
const { restore } = require('../../helpers/db')

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

    const res = await tryCatchAsync(
        'db::restore',
        restore({
            cacheLocation,
            dbVersion: cfg.dbVersion,
            url: cfg.demoDatabaseURL,
            ...argv,
        })
    )

    if (res.err) {
        reporter.error('Failed to restore database')
        reporter.debugErr(res.err)
        process.exit(1)
    }
}

module.exports = {
    command: 'restore <name> [path]',
    desc: 'Restore the database from a backup',
    builder: {
        update: {
            alias: 'u',
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
