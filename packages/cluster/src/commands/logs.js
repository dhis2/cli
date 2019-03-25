const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeDockerImage,
} = require('../common')

const run = async function({ service, v, ...argv }) {
    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository: argv.cluster.dockerComposeRepository,
        force: false,
    })
    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }
    reporter.info(
        `Reading logs from cluster version ${chalk.cyan(v)}${
            service ? ` <${service}>` : ''
        }`
    )
    const res = await tryCatchAsync(
        'exec(docker-compose)',
        exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                makeComposeProject(v),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'logs',
                '-f',
            ].concat(service ? [service] : []),
            env: {
                DHIS2_CORE_TAG: makeDockerImage(v),
                DHIS2_CORE_PORT: '0000',
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
    command: 'logs <v> [service]',
    desc: 'Tail the logs from a given service',
    aliases: 'r',
    handler: run,
}
