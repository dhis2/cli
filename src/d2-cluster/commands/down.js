const chalk = require('chalk');
const exec = require('../../util/exec');
const reporter = require('../../util/reporter');
const { initDockerComposeCache } = require('../common');
const path = require('path');

const makeComposeProject = version => `d2-backend-${version}`;

const run = async function ({ tag, port, getCache, ...argv }) {
  const cacheLocation = await initDockerComposeCache({
    cache: getCache(),
    dockerComposeRepository: argv.backend.dockerComposeRepository,
    force: false
  });
  if (!cacheLocation) {
    reporter.error(`No cached ${chalk.bold("dhis2-backend")} found, please run ${chalk.bold.blue("d2 cluster init")} and try again.`);
    process.exit(1);
  }
  console.log(`Winding down backend version ${chalk.cyan(tag)}`);
  try {
    await exec({
      cmd: "docker-compose",
      args: [
        "-p",
        makeComposeProject(tag),
        "-f",
        path.join(cacheLocation, "docker-compose.yml"),
        "down"
      ],
      env: {
        DHIS2_CORE_TAG: tag,
        DHIS2_CORE_PORT: port
      }
    });
  } catch (e) {
    reporter.error('Failed to execute docker-compose', e);
    process.exit(1);
  }
}

module.exports = {
  command: "down [tag]",
  desc: "Destroy a running container",
  alias: "d",
  builder: {
    'tag': {
      alias: 't',
      desc: "Specify the DHIS2 Core version to use (a tag of hub.docker.com/u/amcgee/dhis2-backend)",
      default: 'dev',
      type: 'string',
    },
    "port": {
      alias: 'p',
      desc: "Specify the port on which to expose the DHIS2 instance",
      type: 'integer',
      default: 8080
    }
  },
  handler: run
};