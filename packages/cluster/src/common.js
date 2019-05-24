const { reporter } = require('@dhis2/cli-helpers-engine')

const defaults = require('./defaults')

const dockerComposeCacheName = 'd2-cluster-docker-compose-v2'

module.exports.initDockerComposeCache = async ({
    cache,
    dockerComposeRepository,
    force,
}) => {
    const exists = await cache.exists(dockerComposeCacheName)
    if (exists && !force) {
        reporter.debug(
            'Skipping docker compose repo initialization, found cached dir'
        )
        return cache.getCacheLocation(dockerComposeCacheName)
    }

    reporter.info('Initializing Docker Compose repository...')
    try {
        return await cache.get(
            dockerComposeRepository,
            dockerComposeCacheName,
            {
                force: true,
            }
        )
    } catch (e) {
        reporter.error('Initialization failed!')
        return null
    }

    return null
}

module.exports.makeComposeProject = version => `d2-cluster-${version}`

module.exports.substituteVersion = (string, version) =>
    replacer(string, 'version', version)

const makeDockerImage = (string = '', substitutes = {}, variants = []) => {
    let res = string

    // the stable channel is just dhis2/core, so if the channel is
    // unspecified or 'stable', we should just strip it out from the
    // image tag
    if (!substitutes.channel || substitutes.channel === 'stable') {
        res = replacer(res, 'channel', '')
    }

    for (const token in substitutes) {
        const value =
            token === 'channel'
                ? `-${substitutes[token]}` // add a leading '-' to channel
                : substitutes[token]

        res = replacer(res, token, value)
    }
    for (const variant of variants) {
        res = `${res}-${variant}`
    }
    return res
}

function replacer(string, token, value) {
    const regexp = new RegExp(`{${token}}`, 'g')
    return string.replace(regexp, value)
}

module.exports.makeEnvironment = (argv = {}, cache = {}, config = {}) => {
    // resolve version for dhis2 and db
    const resolvedDhis2Version =
        argv.dhis2Version ||
        cache.dhis2Version ||
        config.dhis2Version ||
        argv.name
    const resolvedDatabaseVersion =
        argv.dbVersion ||
        cache.dbVersion ||
        config.dbVersion ||
        resolvedDhis2Version ||
        argv.name

    // resolve the docker image
    const resolvedChannel =
        argv.channel || cache.channel || config.channel || defaults.channel
    const resolvedImage =
        argv.image || cache.image || config.image || defaults.image
    const resolvedVariant = argv.variant || cache.variant || config.variant

    const resolvedDockerImage = makeDockerImage(
        resolvedImage,
        {
            channel: resolvedChannel,
            version: resolvedDhis2Version,
        },
        resolvedVariant
    )

    // resolve runtime port and context
    const resolvedPort = argv.port || cache.port || config.port || defaults.port
    const resolvedContext =
        argv.customContext ||
        cache.customContext ||
        config.customContext ||
        defaults.customContext
    const resolvedContextPath = resolvedContext ? `/${argv.name}` : ''

    const env = {
        DHIS2_CORE_NAME: argv.name,
        DHIS2_CORE_CONTEXT_PATH: resolvedContextPath,
        DHIS2_CORE_IMAGE: resolvedDockerImage,
        DHIS2_CORE_VERSION: resolvedDhis2Version,
        DHIS2_CORE_DB_VERSION: resolvedDatabaseVersion,
        DHIS2_CORE_PORT: resolvedPort,
    }

    reporter.info('Runtime environment\n', env)

    return env
}

module.exports.getLocalClusters = async () => {}

module.exports.makeDockerImage = makeDockerImage
