const { reporter, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    resolveConfiguration,
} = require('../../common.js')
const { backup } = require('../../helpers/db.js')

const run = async function (argv) {
    const { name, getCache, path, fat } = argv

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
        'db::backup',
        backup({
            name,
            cacheLocation,
            path,
            fat,
        })
    )

    if (res.err) {
        reporter.error('Failed to backup database')
        reporter.debugErr(res.err)
        process.exit(1)
    }
}

module.exports = {
    command: 'backup <name> <path>',
    desc: 'Backup the database to a file',
    builder: {
        fat: {
            desc: 'Force re-download of cached files',
            type: 'boolean',
            default: false,
        },
    },
    handler: run,
}
