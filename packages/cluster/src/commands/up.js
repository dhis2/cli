const path = require('path')
const {
    reporter,
    exec,
    tryCatchAsync,
    chalk,
} = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeEnvironment,
    makeComposeProject,
    resolveConfiguration,
} = require('../common')
const defaults = require('../defaults')
const { restore } = require('../helpers/db')

const run = async function (argv) {
    const { name, seed, seedFile, update, getCache } = argv

    const cfg = await resolveConfiguration(argv)

    const cacheLocation = await initDockerComposeCache({
        composeProjectName: name,
        cache: getCache(),
        dockerComposeRepository: cfg.dockerComposeRepository,
        dockerComposeDirectory: cfg.dockerComposeDirectory,
        force: update,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    if (update) {
        reporter.info('Pulling latest Docker images...')
        const res = await tryCatchAsync(
            'exec(docker-compose)::pull',
            exec({
                env: makeEnvironment(cfg),
                cmd: 'docker-compose',
                args: [
                    '-p',
                    makeComposeProject(name),
                    '-f',
                    path.join(cacheLocation, 'docker-compose.yml'),
                    'pull',
                ],
                pipe: false,
            })
        )
        if (res.err) {
            reporter.error('Failed to pull latest Docker images')
            process.exit(1)
        }
    }

    if (seed || seedFile) {
        await restore({
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
                makeComposeProject(name),
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
}

module.exports = {
    command: 'up <name>',
    desc: 'Spin up a new cluster',
    aliases: 'u',
    builder: {
        port: {
            alias: 'p',
            desc: `Specify the port on which to expose the DHIS2 instance (default: ${defaults.port})`,
            type: 'integer',
        },
        seed: {
            alias: 's',
            desc: 'Seed the database from a sql dump',
            type: 'boolean',
        },
        seedFile: {
            desc: 'The location of the sql dump to use when seeding that database',
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
        dhis2Config: {
            desc: 'Path to a custom DHIS2 configuration file to use (dhis.conf)',
            type: 'string',
        },
        dbVersion: {
            desc: 'Set the database version',
            type: 'string',
        },
        channel: {
            desc: `Set the release channel to use (default: ${defaults.channel})`,
            type: 'string',
        },
        customContext: {
            alias: 'c',
            desc: 'Serve on a custom context path. If used as a flag, the name of the cluster will be used.',
            type: 'string',
        },
        variant: {
            desc: 'Append variant options to the image',
            type: 'string',
        },
    },
    handler: run,
}
