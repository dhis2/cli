const { reporter } = require('commandant');
const { initDockerComposeCache } = require('../common');

const run = async ({ force, ...argv }) => {
  const dir = initDockerComposeCache({
    cache: argv.getCache(),
    dockerComposeRepository: argv.backend.dockerComposeRepository,
    force
  });
  if (dir) {
    reporter.info(`Docker Compose repository cached at ${dir}`);
  }
};

module.exports = {
  command: "init",
  desc: "Initialize the docker-compose cache",
  alias: "i",
  builder: {
    force: {
      alias: "f",
      desc: "Force re-fetch of cached files",
      type: "boolean"
    }
  },
  handler: run
};