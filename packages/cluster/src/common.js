const { reporter } = require('@dhis2/cli-helpers-engine')

const dockerComposeCacheName = 'd2-cluster-docker-compose'

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
module.exports.makeDockerImage = version => `${version}-alpine`
module.exports.substituteVersion = (string, version) =>
    string.replace(/{version}/g, version)

module.exports.getLocalClusters = async () => {}
