const reporter = require('../util/reporter');

const dockerComposeCacheName = 'docker-compose-backend';

module.exports.initDockerComposeCache = async ({
  cache,
  dockerComposeRepository,
  force
}) => {
  const exists = await cache.exists(dockerComposeCacheName);
  if (exists && !force) {
    reporter.debug(
      "Skipping docker compose repo initialization, found cached dir"
    );
    return cache.getCacheLocation(dockerComposeCacheName);
  }

  if (force) {
    reporter.info("Initializing Docker Compose repository...");
    try {
      return await cache.get(dockerComposeRepository, dockerComposeCacheName, {
        force: true
      });
    } catch (e) {
      reporter.error("Initialization failed!");
      return null;
    }
  }

  return null;
};

module.exports.makeComposeProject = version => `d2-cluster-${version}`;