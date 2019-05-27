const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    resolveConfiguration,
} = require('../common')
const defaults = require('../defaults')

const run = async function({ service, name, cluster, ...argv }) {
    const { dockerComposeRepository } = resolveConfiguration(argv, {}, cluster)
    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository,
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
                makeComposeProject(name),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'logs',
                '-f',
            ].concat(service ? [service] : []),
            env: {
                DHIS2_CORE_NAME: name,
                DHIS2_CORE_PORT: 8000, // doesn't matter
            },
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
