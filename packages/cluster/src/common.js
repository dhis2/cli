const path = require('path')
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

    // master is published as latest on Dockerhub repo core-dev
    // https://github.com/dhis2/operations-handbook/blob/7e3dd185c5c0992e625725724fd81468d95de259/releases/war_docker_schemes.md?plain=1#L70
    if (substitutes.version == 'master') {
        substitutes.version = 'latest'
    }

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

function dhis2Home(version) {
    if (!dockerImageUsingJib(version)) {
        return '/DHIS2_home'
    }

    return '/opt/dhis2'
}

/*
 * Docker images for releases starting from 2.39.0, 2.38.2, 2.37.8.2 or 2.37.9
 * (not released at the time this was written) do not create directory
 * /DHIS2_home anymore. See https://github.com/dhis2/dhis2-core/pull/11981
 * Instead /opt/dhis2 is created which is the default location used by DHIS2.
 */
function dockerImageUsingJib(version) {
    version = version.trim() || ''

    if (version == 'master') {
        return true
    }

    const segments = version
        .split('.')
        .map(s => s.trim())
        .filter(s => s.length > 0) // to remove empty segments we get with versions like "2."
        .map(n => parseInt(n, 10))
        .filter(n => !Number.isNaN(n))
    if (segments.length < 2) {
        throw new Error(
            `Invalid version format: '${version}'. Must be 'master' or '2.major.minor.patch'. 'patch' being optional.`
        )
    }

    // omit the "2." as we are not using semver; the second segment is our actual major version
    // eslint-disable-next-line no-unused-vars
    const [_, major, minor = 0, patch = 0] = segments

    if (major >= 39) {
        return true
    } else if (major == 38) {
        return minor >= 2
    } else if (major == 37) {
        if (minor >= 9 || (minor == 8 && patch >= 2)) {
            return true
        }
        return false
    } else {
        return false
    }
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
    resolved.dhis2Home = dhis2Home(resolved.dhis2Version)
    resolved.dbVersion = resolved.dbVersion || resolved.dhis2Version
    if (resolved.dbVersion == 'master') {
        // https://github.com/dhis2/operations-handbook/blob/7e3dd185c5c0992e625725724fd81468d95de259/README.md?plain=1#L325
        // DBs follow a different naming scheme than docker images
        resolved.dbVersion = 'dev'
    }
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
                dhis2Config: resolved.dhis2Config,
                dhis2Home: resolved.dhis2Home,
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
        DHIS2_HOME: cfg.dhis2Home,
        DHIS2_CORE_NAME: cfg.name,
        DHIS2_CORE_IMAGE: cfg.dockerImage,
        DHIS2_CORE_CONTEXT_PATH: cfg.contextPath,
        DHIS2_CORE_VERSION: cfg.dhis2Version,
        DHIS2_CORE_DB_VERSION: cfg.dbVersion,
        DHIS2_CORE_PORT: cfg.port,
    }
    if (cfg.dhis2Config) {
        env.DHIS2_CORE_CONFIG = cfg.dhis2Config
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

    const exists = await cache.exists(clusterDir)
    if (!exists) return []

    const stat = await cache.stat(clusterDir)
    const promises = Object.keys(stat.children)
        .filter(name => cache.exists(path.join(clusterDir, name)))
        .map(name => resolveConfiguration({ name, getCache: argv.getCache }))
    return await Promise.all(promises)
}

module.exports.makeDockerImage = makeDockerImage
module.exports.resolveConfiguration = resolveConfiguration
module.exports.dockerImageUsingJib = dockerImageUsingJib
