const colors = require('colors');
const path = require('path');
const exec = require('../../util/exec');
const { config, cache, reporter } = require("commandant");
const { initDockerComposeCache } = require('../common');
const { tryCatchAsync } = require('../../util/helpers');

const makeComposeProject = version => `d2-backend-${version}`;

const run = async function ({ args, options } = {}) {
  const tag = args[0];
  const { port = config.backend.port } = options;
  const cacheLocation = await initDockerComposeCache(false);
  if (!cacheLocation) {
    reporter.error('Failed to initialize cache...');
    process.exit(1);
  }
  reporter.info(`Spinning up backend version ${colors.cyan(tag)}`);
  const res = await tryCatchAsync('exec(docker-compose)',
    exec({
      cmd: 'docker-compose',
      args: ["-p", makeComposeProject(tag), "-f", path.join(cacheLocation, "docker-compose.yml"), "up", '-d'],
      env: {
        'DHIS2_CORE_TAG': tag,
        'DHIS2_CORE_PORT': port,
      },
    })
  );
  if (res.err) {
    reporter.error('Failed to spin up backend docker-compose cluster');
    process.exit(1);
  }
}

module.exports = {
  name: "up <tag>",
  alias: "u",
  options: [
    [
      "--tag [t]",
      "Specify the DHIS2 Core version to use (a tag of hub.docker.com/u/amcgee/dhis2-backend)",
      "dev"
    ],
    [
      "--port [p]",
      "Specify the port on which to expose the DHIS2 instance",
      "8080"
    ]
  ],
  run
};