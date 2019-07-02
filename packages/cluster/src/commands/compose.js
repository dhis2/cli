const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeEnvironment,
    resolveConfiguration,
} = require('../common')

const run = async function(argv) {
    const { name, service, args } = argv
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
    const res = await tryCatchAsync(
        'exec(docker-compose)',
        exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                makeComposeProject(name),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                ...args,
            ].concat(service ? [service] : []),
            env: makeEnvironment(cfg),
            pipe: true,
        })
    )
    if (res.err) {
        reporter.error('Failed to run docker-compose command')
        process.exit(1)
    }
}

module.exports = {
    command: 'compose <name> [args...]',
    desc: 'Run arbitrary docker-compose commands against a DHIS2 cluster',
    aliases: 'c',
    handler: run,
}
