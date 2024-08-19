const path = require('path')
const {
    reporter,
    exec,
    tryCatchAsync,
    chalk,
} = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeEnvironment,
    resolveConfiguration,
} = require('../common')
const defaults = require('../defaults')

const run = async function (argv) {
    const { name, service } = argv
    const cfg = await resolveConfiguration(argv)

    const cacheLocation = await initDockerComposeCache({
        composeProjectName: name,
        cache: argv.getCache(),
        dockerComposeRepository: cfg.dockerComposeRepository,
        dockerComposeDirectory: cfg.dockerComposeDirectory,
        force: false,
    })
    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }
    reporter.info(`Spinning up cluster version ${chalk.cyan(name)}`)
    const res = await tryCatchAsync(
        'exec(docker compose)',
        exec({
            cmd: 'docker',
            args: [
                'compose',
                '-p',
                makeComposeProject(name),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'restart',
            ].concat(service ? [service] : []),
            env: makeEnvironment(cfg),
            pipe: true,
        })
    )
    if (res.err) {
        reporter.error('Failed to restart cluster service(s)')
        process.exit(1)
    }
}

module.exports = {
    command: 'restart <name> [service]',
    desc: 'Restart a cluster or cluster service',
    aliases: 'r',
    builder: {
        port: {
            alias: 'p',
            desc: `Specify the port on which to expose the DHIS2 instance (default: ${defaults.port})`,
            type: 'integer',
        },
    },
    handler: run,
}
