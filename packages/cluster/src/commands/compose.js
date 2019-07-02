const path = require('path')
const { spawn } = require('child_process')
const { reporter, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeEnvironment,
    resolveConfiguration,
} = require('../common')

const run = async function(argv) {
    const { name, _ } = argv
    const cfg = await resolveConfiguration(argv)

    const args = _.slice(_.findIndex(x => x === 'compose') + 1)
    reporter.debug('Passing arguments to docker-compose', args)

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
        spawn(
            'docker-compose',
            [
                '-p',
                makeComposeProject(name),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                ...args,
            ],
            {
                env: {
                    ...process.env,
                    ...makeEnvironment(cfg),
                },
                stdio: 'inherit',
            }
        )
    )
    if (res.err) {
        reporter.error('Failed to run docker-compose command')
        process.exit(1)
    }
}

module.exports = {
    command: 'compose <name>',
    desc:
        'Run arbitrary docker-compose commands against a DHIS2 cluster.\nNOTE: pass -- after <name>',
    aliases: 'c',
    handler: run,
}
