const { reporter } = require('@dhis2/cli-helpers-engine')
const { initDockerComposeCache, resolveConfiguration } = require('../../common')
const { backup } = require('../../helpers/db')

const run = async function(argv) {
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

    return await backup({
        name,
        cacheLocation,
        path,
        fat,
    })
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
