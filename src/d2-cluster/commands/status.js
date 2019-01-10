const chalk = require("chalk");
const exec = require("../../util/exec");
const reporter = require("../../util/reporter");
const { initDockerComposeCache, makeComposeProject } = require("../common");

const run = async function({ tag = "dev", getCache, ...argv }) {
  const cacheLocation = await initDockerComposeCache({
    cache: getCache(),
    dockerComposeRepository: argv.backend.dockerComposeRepository,
    force: false,
  });
  try {
    await exec({
      cmd: "docker",
      args: ["ps", "--filter", `name=${makeComposeProject(tag)}`],
      pipe: true,
      quiet: !argv.verbose
    });
  } catch (e) {
    reporter.error("Failed to execute 'docker ps'", e);
    process.exit(1);
  }
};

module.exports = {
  command: "status [tag]",
  desc: "Check the status of cluster containers",
  alias: "s",
  handler: run
};
