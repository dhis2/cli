const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeDockerImage,
} = require('../common')

const run = async function({ service, v, port, ...argv }) {
    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository: argv.cluster.dockerComposeRepository,
        force: false,
    })
    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }
    reporter.info(`Spinning up cluster version ${chalk.cyan(v)}`)
    const res = await tryCatchAsync(
        'exec(docker-compose)',
        exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                makeComposeProject(v),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'restart',
            ].concat(service ? [service] : []),
            env: {
                DHIS2_CORE_TAG: makeDockerImage(v),
                DHIS2_CORE_PORT: port,
            },
            pipe: true,
        })
    )
    if (res.err) {
        reporter.error('Failed to restart cluster service(s)')
        process.exit(1)
    }
}

module.exports = {
    command: 'restart <v> [service]',
    desc: 'Restart a cluster or cluster service',
    aliases: 'r',
    builder: {
        port: {
            alias: 'p',
            desc: 'Specify the port on which to expose the DHIS2 instance',
            type: 'integer',
            default: 8080,
        },
    },
    handler: run,
}
