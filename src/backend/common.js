const { config, cache, reporter } = require("commandant");

const dockerComposeCacheName = 'docker-compose-backend';

module.exports.initDockerComposeCache = async (force) => {
  const exists = await cache.exists(dockerComposeCacheName);
  if (exists && !force) {
    reporter.debug('Skipping docker compose repo initialization, found cached dir');
    return cache.getCacheLocation(dockerComposeCacheName);
  }

  reporter.info('Initializing Docker Compose repository...')
  try {
    return await cache.get(config.backend.dockerComposeRepository, dockerComposeCacheName, {
      force: true
    }); 
  } catch (e) {
    reporter.error('Initialization failed!');
    return null;
  }
}