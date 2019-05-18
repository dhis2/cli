const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeDockerImage,
    substituteVersion,
} = require('../common')

const defaults = require('../defaults')
const { seed: doSeed } = require('../db')

const run = async function({
    name,
    port,
    seed,
    seedFile,
    update,
    image,
    dhis2Version,
    ...argv
}) {
    const { cluster } = argv

    const resolvedVersion = dhis2Version || name
    const resolvedImage = substituteVersion(
        image || cluster.image || defaults.image,
        resolvedVersion
    )
    const resolvedPort = port || cluster.port || defaults.port

    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository:
            argv.cluster.dockerComposeRepository ||
            defaults.dockerComposeRepository,
        force: update,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    if (seed || seedFile) {
        await doSeed({
            cacheLocation,
            dbVersion: resolvedVersion,
            name,
            path: seedFile,
            update,
            ...argv,
        })
    }

    reporter.info(`Spinning up cluster ${chalk.cyan(name)}`)

    const res = await tryCatchAsync(
        'exec(docker-compose)',
        exec({
            cmd: 'docker-compose',
            args: [
                '-p',
                makeComposeProject(name),
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'up',
                '-d',
            ],
            env: {
                DHIS2_CORE_NAME: name,
                DHIS2_CORE_IMAGE: resolvedImage,
                DHIS2_CORE_VERSION: resolvedVersion,
                DHIS2_CORE_PORT: resolvedPort,
            },
            pipe: true,
        })
    )
    if (res.err) {
        reporter.error('Failed to spin up cluster docker-compose cluster')
        process.exit(1)
    }
}

module.exports = {
    command: 'up <name>',
    desc: 'Spin up a new cluster',
    aliases: 'u',
    builder: {
        port: {
            alias: 'p',
            desc: 'Specify the port on which to expose the DHIS2 instance',
            type: 'integer',
            default: defaults.port,
        },
        seed: {
            alias: 's',
            desc: 'Seed the detabase from a sql dump',
            type: 'boolean',
            default: false,
        },
        seedFile: {
            desc:
                'The location of the sql dump to use when seeding that database',
            type: 'string',
        },
        update: {
            alias: 'u',
            desc: 'Indicate that d2 cluster should re-download cached files',
            type: 'boolean',
            default: false,
        },
        image: {
            alias: 'i',
            desc: 'Specify the Docker image to use',
            type: 'string',
            default: defaults.image,
        },
        dhis2Version: {
            desc: 'Set the DHIS2 version',
            type: 'string',
            default: '',
        },
    },
    handler: run,
}
