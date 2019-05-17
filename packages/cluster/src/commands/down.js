const chalk = require('chalk')
const path = require('path')
const { exec, reporter } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeDockerImage,
} = require('../common')
const defaults = require('../defaults')

const run = async function({ name, clean, getCache, ...argv }) {
    const cacheLocation = await initDockerComposeCache({
        cache: getCache(),
        dockerComposeRepository:
            argv.cluster.dockerComposeRepository ||
            defaults.dockerComposeRepository,
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
                makeComposeProject(name),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'down',
            ].concat(clean ? ['--volumes'] : []),
            env: {
                DHIS2_CORE_NAME: name,
                DHIS2_CORE_PORT: 8000, // doesn't matter
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
