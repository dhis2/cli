const chalk = require('chalk')
const path = require('path')
const { exec, reporter } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    resolveConfiguration,
} = require('../common')

const defaults = require('../defaults')

const run = async function({ name, clean, getCache, cluster, ...argv }) {
    const {
        dockerComposeRepository,
        dockerComposeDirectory,
    } = resolveConfiguration(argv, {}, cluster)

    const composeProjectName = makeComposeProject(name)
    const cacheLocation = await initDockerComposeCache({
        composeProjectName,
        cache: getCache(),
        dockerComposeRepository,
        dockerComposeDirectory,
        force: false,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    console.log(`Winding down cluster ${chalk.cyan(name)}`)
    try {
        await exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                composeProjectName,
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'down',
            ].concat(clean ? ['--volumes'] : []),
            env: {
                DHIS2_CORE_IMAGE: defaults.image,
                DHIS2_CORE_NAME: name,
                DHIS2_CORE_PORT: defaults.port,
            },
        })
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
