const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const {
    initDockerComposeCache,
    makeComposeProject,
    makeEnvironment,
} = require('../common')

const defaults = require('../defaults')
const { seed: doSeed } = require('../db')

const run = async function(argv) {
    const { cluster, name, seed, seedFile, update } = argv

    const runtime = makeEnvironment(argv, {}, cluster)

    const cacheLocation = await initDockerComposeCache({
        cache: argv.getCache(),
        dockerComposeRepository:
            cluster.dockerComposeRepository || defaults.dockerComposeRepository,
        force: update,
    })

    if (!cacheLocation) {
        reporter.error('Failed to initialize cache...')
        process.exit(1)
    }

    if (seed || seedFile) {
        await doSeed({
            cacheLocation,
            dbVersion: runtime.DHIS2_CORE_DB_VERSION,
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
            env: runtime,
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
            desc:
                'Set the release channel to use (default: ${defaults.stable})',
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
