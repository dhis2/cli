const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeDockerImage,
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
    customContext,
    variant,
    channel,
    ...argv
}) {
    const { cluster } = argv

    const resolvedVersion = dhis2Version || cluster.dhis2Version || name
    const resolvedChannel = channel || cluster.channel || defaults.channel
    const resolvedImage = image || cluster.image || defaults.image
    const resolvedVariant = variant || cluster.variant

    const resolvedDockerImage = makeDockerImage(
        resolvedImage,
        {
            channel: resolvedChannel,
            version: resolvedVersion,
        },
        resolvedVariant
    )

    const resolvedPort = port || cluster.port || defaults.port
    const resolvedContext =
        customContext || cluster.customContext || defaults.customContext
    const resolvedContextPath = resolvedContext ? `/${name}` : ''

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

    console.info({
        DHIS2_CORE_NAME: name,
        DHIS2_CORE_CONTEXT_PATH: resolvedContextPath,
        DHIS2_CORE_IMAGE: resolvedDockerImage,
        DHIS2_CORE_VERSION: resolvedVersion,
        DHIS2_CORE_PORT: resolvedPort,
    })

    process.exit(0)

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
                DHIS2_CORE_CONTEXT_PATH: resolvedContextPath,
                DHIS2_CORE_IMAGE: resolvedDockerImage,
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
        },
        seed: {
            alias: 's',
            desc: 'Seed the detabase from a sql dump',
            type: 'boolean',
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
        },
        image: {
            alias: 'i',
            desc: 'Specify the Docker image to use',
            type: 'string',
        },
        dhis2Version: {
            desc: 'Set the DHIS2 version',
            type: 'string',
        },
        channel: {
            desc: 'Set the release channel to use',
            type: 'string',
        },
        customContext: {
            alias: 'c',
            desc: 'Serve on a custom context path',
            type: 'boolean',
        },
        variant: {
            desc: 'Append variant options to the image',
            type: 'array',
        },
    },
    handler: run,
}
