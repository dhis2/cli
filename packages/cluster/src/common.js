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

function makeDockerImage(string = '', substitutes = {}, variant = '') {
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

    if (variant) {
        res = `${res}-${variant}`
    }
    return res
}

function replacer(string, token, value) {
    const regexp = new RegExp(`{${token}}`, 'g')
    return string.replace(regexp, value)
}

function resolveConfiguration(argv = {}, cache = {}, config = {}) {
    const resolved = Object.assign({}, defaults, config, cache, argv)

    // resolve specials...
    resolved.dhis2Version = resolved.dhis2Version || resolved.name
    resolved.dbVersion = resolved.dbVersion || resolved.dhis2Version
    resolved.contextPath = resolved.customContext ? `/${resolved.name}` : ''

    resolved.dockerImage = makeDockerImage(
        resolved.image,
        {
            channel: resolved.channel,
            version: resolved.dhis2Version,
        },
        resolved.variant
    )

    reporter.debug('Resolved configuration\n', resolved)

    return resolved
}

module.exports.makeEnvironment = cfg => {
    const env = {
        DHIS2_CORE_NAME: cfg.name,
        DHIS2_CORE_IMAGE: cfg.dockerImage,
        DHIS2_CORE_CONTEXT_PATH: cfg.contextPath,
        DHIS2_CORE_VERSION: cfg.dhis2Version,
        DHIS2_CORE_DB_VERSION: cfg.dbVersion,
        DHIS2_CORE_PORT: cfg.port,
    }

    reporter.debug('Runtime environment\n', env)

    return env
}

module.exports.getLocalClusters = async () => {}

module.exports.makeDockerImage = makeDockerImage
module.exports.resolveConfiguration = resolveConfiguration
