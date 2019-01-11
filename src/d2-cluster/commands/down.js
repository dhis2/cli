const chalk = require('chalk');
const path = require("path");
const exec = require('../../util/exec');
const reporter = require('../../util/reporter');
const { initDockerComposeCache, makeComposeProject } = require("../common");

const run = async function ({ tag = 'dev', getCache, ...argv }) {
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
        DHIS2_CORE_PORT: '0000' // Doesn't matter for `down`
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
  aliases: "d",
  builder: {
    "port": {
      alias: 'p',
      desc: "Specify the port on which to expose the DHIS2 instance",
      type: 'integer',
      default: 8080
    }
  },
  handler: run
};