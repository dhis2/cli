const { makeComposeProject } = require('./common')
const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')

const downloadDatabase = async ({ cache, path, ver, update, url }) => {
    if (path) {
        return path.resolve(path)
    } else {
        const ext = '.sql.gz' //dbUrl.endsWith('.gz') ? '.gz' : '.sql'
        const cacheName = `cluster-db-${ver}${ext}`
        if (!update && (await cache.exists(cacheName))) {
            reporter.info(
                `Found cached database version ${chalk.bold(
                    ver
                )}, use --update to re-download`
            )
            return cache.getCacheLocation(cacheName)
        } else {
            const dbUrl = url.replace(/{version}/g, ver)
            reporter.info(
                `Downloading demo database version ${chalk.bold(ver)}...`
            )

            try {
                return await cache.get(dbUrl, cacheName, {
                    force: update,
                    raw: true,
                })
            } catch (e) {
                reporter.error('Failed to fetch demo database')
                reporter.debugErr(e)
                return null
            }
        }
    }
}

const seedFromFile = async ({ cacheLocation, dbFile, ver, name }) => {
    reporter.info(`Seeding database (this may take some time)...`)
    reporter.debug(`Seeding from database dump ${chalk.bold(dbFile)}`)

    await tryCatchAsync(
        'exec(seed.sh)',
        exec({
            cmd: './scripts/seed.sh',
            cwd: cacheLocation,
            args: [dbFile],
            pipe: false,
            env: {
                DOCKER_COMPOSE: `docker-compose -p ${makeComposeProject(name)}`,
            },
        })
    )
}

module.exports.seed = async ({
    cacheLocation,
    ver,
    name,
    path: dbPath,
    url,
    update,
    ...argv
}) => {
    const dbFile = dbPath
        ? path.resolve(dbPath)
        : await downloadDatabase({
              cache: argv.getCache(),
              ver,
              url: url || argv.cluster.demoDatabaseURL,
              update,
          })
    await seedFromFile({ cacheLocation, dbFile, ver, name })
}
