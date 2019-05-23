const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeEnvironment,
    resolveConfiguration,
    writeCache,
    loadCache,
} = require('../common')

const defaults = require('../defaults')
const { seed: doSeed } = require('../db')

const run = async function(argv) {
    const { cluster, name, seed, seedFile, update } = argv
    const cfg = resolveConfiguration(argv, {}, cluster)
    const composeProjectName = makeComposeProject(name)

    const cacheLocation = await initDockerComposeCache({
        composeProjectName,
        cache: argv.getCache(),
        dockerComposeRepository: cfg.dockerComposeRepository,
        dockerComposeDirectory: cfg.dockerComposeDirectory,
        force: update,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    const cache = loadCache(cacheLocation)
    reporter.debug(
        `cached configuration for cluster ${composeProjectName}`,
        cache
    )

    const resolvedVersion = dhis2Version || cache.dhis2Version || name
    const resolvedImage = substituteVersion(
        image || cache.image || cluster.image || defaults.image,
        resolvedVersion
    )

    const resolvedPort = port || cache.port || cluster.port || defaults.port
    const resolvedContext =
        customContext ||
        cache.customContext ||
        cluster.customContext ||
        defaults.customContext
    const resolvedContextPath = resolvedContext ? `/${name}` : ''

    if (seed || seedFile) {
        await doSeed({
            name,
            cacheLocation,
            dbVersion: cfg.dbVersion,
            url: cfg.demoDatabaseURL,
            path: seedFile,
            update,
            ...argv,
        })
    }

    reporter.info(`Spinning up cluster ${chalk.cyan(name)}`)

    const res = await tryCatchAsync(
        'exec(docker-compose)',
        exec({
            env: makeEnvironment(cfg),
            cmd: 'docker-compose',
            args: [
                '-p',
                composeProjectName,
                '-f',
                path.join(cacheLocation, 'docker-compose.yml'),
                'up',
                '-d',
            ],
            pipe: true,
        })
    )
    if (res.err) {
        reporter.error('Failed to spin up cluster docker-compose cluster')
        process.exit(1)
    }

    writeCache(
        {
            contextPath: resolvedContextPath,
            port: resolvedPort,
            image: resolvedImage,
            version: resolvedVersion,
        },
        cacheLocation
    )
}

module.exports = {
    command: 'up <name>',
    desc: 'Spin up a new cluster',
    aliases: 'u',
    builder: {
        port: {
            alias: 'p',
            desc: `Specify the port on which to expose the DHIS2 instance (default: ${
                defaults.port
            })`,
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
        dbVersion: {
            desc: 'Set the database version',
            type: 'string',
        },
        channel: {
            desc: `Set the release channel to use (default: ${
                defaults.channel
            })`,
            type: 'string',
        },
        customContext: {
            alias: 'c',
            desc: 'Serve on a custom context path',
            type: 'boolean',
        },
        variant: {
            desc: 'Append variant options to the image',
            type: 'string',
        },
    },
    handler: run,
}
