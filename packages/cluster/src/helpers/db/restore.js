const path = require('path')
const { reporter, exec, chalk } = require('@dhis2/cli-helpers-engine')
const { makeComposeProject, substituteVersion } = require('../../common')

const downloadDatabase = async ({ cache, dbVersion, update, url }) => {
    const ext = '.sql.gz' //dbUrl.endsWith('.gz') ? '.gz' : '.sql'
    const cacheName = `cluster-db-${dbVersion}${ext}`
    if (!update && (await cache.exists(cacheName))) {
        reporter.info(
            `Found cached database version ${chalk.bold(
                dbVersion
            )}, use --update to re-download`
        )
        return cache.getCacheLocation(cacheName)
    } else {
        const dbUrl = substituteVersion(url, dbVersion)
        reporter.info(
            `Downloading demo database version ${chalk.bold(dbVersion)}...`
        )

        try {
            return await cache.get(dbUrl, cacheName, {
                force: update,
                raw: true,
            })
        } catch (e) {
            reporter.debugErr('[downloadDatabase]', e)
            throw new Error('Failed to fetch demo database')
        }
    }
}

const restoreFromFile = async ({ cacheLocation, dbFile, name }) => {
    reporter.info(`Restoring database (this may take some time)...`)
    reporter.debug(`Restoring from database dump ${chalk.bold(dbFile)}`)

    await exec({
        cmd: './scripts/seed.sh',
        cwd: cacheLocation,
        args: [dbFile],
        pipe: false,
        env: {
            DOCKER_COMPOSE: `docker-compose -p ${makeComposeProject(name)}`,
        },
    })
}

module.exports = async ({
    cacheLocation,
    dbVersion,
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
              dbVersion,
              url,
              update,
          })

    await restoreFromFile({ cacheLocation, dbFile, name })
}
