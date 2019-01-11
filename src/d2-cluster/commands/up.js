const chalk = require('chalk');
const path = require('path');
const exec = require('../../util/exec');
const reporter = require('../../util/reporter');
const { initDockerComposeCache, makeComposeProject } = require("../common");
const { tryCatchAsync } = require('../../util/helpers');

const run = async function ({ tag = 'dev', port, ...argv }) {
  const cacheLocation = await initDockerComposeCache({
    cache: argv.getCache(),
    dockerComposeRepository: argv.backend.dockerComposeRepository,
    force: false
  });
  if (!cacheLocation) {
    reporter.error('Failed to initialize cache...');
    process.exit(1);
  }
  reporter.info(`Spinning up backend version ${chalk.cyan(tag)}`);
  const res = await tryCatchAsync('exec(docker-compose)',
    exec({
      cmd: 'docker-compose',
      args: ["-p", makeComposeProject(tag), "-f", path.join(cacheLocation, "docker-compose.yml"), "up", '-d'],
      env: {
        'DHIS2_CORE_TAG': tag,
        'DHIS2_CORE_PORT': port,
      },
      pipe: true,
    })
  );
  if (res.err) {
    reporter.error('Failed to spin up backend docker-compose cluster');
    process.exit(1);
  }
}

module.exports = {
  command: "up [tag]",
  desc: 'Spin up a new cluster',
  aliases: "u",
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