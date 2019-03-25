const chalk = require('chalk')
const path = require('path')
const { exec, reporter } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeDockerImage,
} = require('../common')

const run = async function({ v, clean, getCache, ...argv }) {
    const cacheLocation = await initDockerComposeCache({
        cache: getCache(),
        dockerComposeRepository: argv.cluster.dockerComposeRepository,
        force: false,
    })
    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }
    console.log(`Winding down cluster version ${chalk.cyan(v)}`)
    try {
        await exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                makeComposeProject(v),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'down',
            ].concat(clean ? ['--volumes'] : []),
            env: {
                DHIS2_CORE_TAG: makeDockerImage(v),
                DHIS2_CORE_PORT: '0000', // Doesn't matter for `down`
            },
        })
    } catch (e) {
        reporter.error('Failed to execute docker-compose', e)
        process.exit(1)
    }
}

module.exports = {
    command: 'down <v>',
    desc: 'Destroy a running container',
    aliases: 'd',
    builder: {
        port: {
            alias: 'p',
            desc: 'Specify the port on which to expose the DHIS2 instance',
            type: 'integer',
            default: 8080,
        },
        clean: {
            desc: 'Destroy all data volumes as well as ephemeral containers',
            type: 'boolean',
            default: false,
        },
    },
    handler: run,
}
