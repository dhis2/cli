const { reporter } = require('commandant');
const { initDockerComposeCache } = require('../common');

const run = async ({ options }) => {
  const dir = initDockerComposeCache(options.force);
  if (dir) {
    reporter.info(`Docker Compose repository cached at ${dir}`);
  }
};

module.exports = {
  name: 'init',
  alias: 'i',
  options: [
    ['-f, --force', 'Force re-fetch of cached files']
  ],
  run
}