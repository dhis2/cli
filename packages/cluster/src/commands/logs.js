const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeEnvironment,
    resolveConfiguration,
} = require('../common')

const run = async function(argv) {
    const { service, name } = argv
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

    reporter.info(
        `Reading logs from cluster version ${chalk.cyan(name)}${
            service ? ` <${service}>` : ''
        }`
    )

    const res = await tryCatchAsync(
        'exec(docker-compose)',
        exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                name,
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'logs',
                '-f',
            ].concat(service ? [service] : []),
            env: makeEnvironment(cfg),
            pipe: true,
        })
    )
    if (res.err) {
        reporter.error('Failed to read cluster logs')
        process.exit(1)
    }
}

module.exports = {
    command: 'logs <name> [service]',
    desc: 'Tail the logs from a given service',
    aliases: 'r',
    handler: run,
}
