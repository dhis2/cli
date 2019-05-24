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
    const name = argv.name
    const resolved = Object.assign({}, defaults, config, cache, argv)

    // resolve specials...
    const resolvedDhis2Version = resolved.dhis2Version || name
    const resolvedDatabaseVersion = resolved.dbVersion || resolvedDhis2Version
    const resolvedContextPath = resolved.customContext ? `/${name}` : ''

    const dockerImage = makeDockerImage(
        resolved.image,
        {
            channel: resolved.channel,
            version: resolvedDhis2Version,
        },
        resolved.variant
    )

    const env = {
        DHIS2_CORE_NAME: name,
        DHIS2_CORE_IMAGE: dockerImage,
        DHIS2_CORE_CONTEXT_PATH: resolvedContextPath,

        DHIS2_CORE_VERSION: resolvedDhis2Version,
        DHIS2_CORE_DB_VERSION: resolvedDatabaseVersion,
        DHIS2_CORE_PORT: resolved.port,
    }

    reporter.debug('Runtime environment\n', env)

    return env
}

module.exports.getLocalClusters = async () => {}

module.exports.makeDockerImage = makeDockerImage
