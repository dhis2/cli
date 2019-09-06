const path = require('path')
const fs = require('fs')

const { reporter } = require('@dhis2/cli-helpers-engine')

const defaults = require('./defaults')

const clusterDir = 'clusters'
const dockerComposeCacheName = 'docker-compose'
const cacheFile = 'config.json'

module.exports.initDockerComposeCache = async ({
    composeProjectName,
    cache,
    dockerComposeRepository,
    dockerComposeDirectory,
    force,
}) => {
    const cacheDir = path.join(
        clusterDir,
        composeProjectName,
        dockerComposeCacheName
    )

    const cachePath = path.join(cacheDir, dockerComposeDirectory)

    const exists = await cache.exists(cachePath)

    if (exists && !force) {
        reporter.debug(
            'Skipping docker compose repo initialization, found cached dir'
        )
    } else {
        reporter.info('Initializing Docker Compose repository...')

        try {
            await cache.get(dockerComposeRepository, cacheDir, {
                force: true,
            })

            const created = await cache.exists(cachePath)

            if (created) {
                reporter.debug(`Cache created at: ${cachePath}`)
            }
        } catch (e) {
            reporter.error('Initialization failed!')
            return null
        }
    }

    return cache.getCacheLocation(cachePath)
}

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

async function resolveConfiguration(argv = {}) {
    const file = path.join(clusterDir, argv.name, cacheFile)

    let currentCache
    try {
        currentCache = JSON.parse(await argv.getCache().read(file))
    } catch (e) {
        reporter.debug('JSON parse of cache file failed', e)
    }

    let currentConfig
    if (argv.cluster && argv.cluster.clusters) {
        currentConfig = argv.cluster.clusters[argv.name]
    }

    // order matters! it defines the precedence of configuration
    const cache = Object.assign({}, currentConfig, currentCache)

    const config = argv.cluster
    const args = argv

    // order matters! it defines the precedence of configuration
    const resolved = Object.assign({}, defaults, config, cache, args)

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

    await argv.getCache().write(
        file,
        JSON.stringify(
            {
                channel: resolved.channel,
                dbVersion: resolved.dbVersion,
                dhis2Version: resolved.dhis2Version,
                customContext: resolved.customContext,
                image: resolved.image,
                port: resolved.port,
            },
            null,
            4
        )
    )

    return resolved
}

module.exports.cleanCache = async ({ cache, name }) =>
    await cache.purge(path.join(clusterDir, name))

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

// This has to match the normalization done by docker-compose to reliably get container statuses
//   from https://github.com/docker/compose/blob/c8279bc4db56f49cf2e2b80c8734ced1c418b856/compose/cli/command.py#L154
const normalizeName = name => name.replace(/[^-_a-z0-9]/g, '')

module.exports.makeComposeProject = name => `d2-cluster-${normalizeName(name)}`

module.exports.listClusters = async argv => {
    const cache = argv.getCache()

    const stat = await cache.stat(clusterDir)
    const promises = Object.keys(stat.children)
        .filter(name => cache.exists(path.join(clusterDir, name)))
        .map(name => resolveConfiguration({ name, getCache: argv.getCache }))
    return await Promise.all(promises)
}

module.exports.makeDockerImage = makeDockerImage
module.exports.resolveConfiguration = resolveConfiguration
