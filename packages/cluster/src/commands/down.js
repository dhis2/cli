const path = require('path')
const { exec, reporter, chalk } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    resolveConfiguration,
    makeComposeProject,
    makeEnvironment,
    cleanCache,
} = require('../common')

const run = async function(argv) {
    const { name, clean, getCache } = argv
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

    reporter.info(`Winding down cluster ${chalk.cyan(name)}`)
    try {
        await exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                makeComposeProject(name),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'down',
            ].concat(clean ? ['--volumes'] : []),
            env: makeEnvironment(cfg),
        })

        if (clean) {
            cleanCache({
                name,
                cache: getCache(),
            })
        }
    } catch (e) {
        reporter.error('Failed to execute docker-compose', e)
        process.exit(1)
    }
}

module.exports = {
    command: 'down <name>',
    desc: 'Destroy a running container',
    aliases: 'd',
    builder: {
        clean: {
            desc: 'Destroy all data volumes as well as ephemeral containers',
            type: 'boolean',
            default: false,
        },
    },
    handler: run,
}
