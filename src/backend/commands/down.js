const colors = require('colors');
const exec = require('../../util/exec');
const { cache, reporter } = require('../../util/commandant');

const makeComposeProject = version => `d2-backend-${version}`;

const run = async function ({ args, options = {} } = {}) {
  const { tag, port } = options;
  if (!await cache.exists("backend/dhis2-backend-master")) {
    reporter.error(`No cached ${"dhis2-backend".bold} found, please run ${"d2 backend init".bold.blue} and try again.`);
    process.exit(1);
  }
  console.log(`Winding down backend version ${colors.cyan(tag)}`);
  try {
    await exec({
      cmd: 'docker-compose',
      args: ["-p", makeComposeProject(tag), "-f", cache.getCacheLocation("backend/dhis2-backend-master/docker-compose.yml"), "down"],
      env: {
        'DHIS2_CORE_TAG': tag,
        'DHIS2_CORE_PORT': port,
      },
    });
  } catch (e) {
    process.exit(1);
  }
}

module.exports = {
  name: 'down',
  alias: 'd',
  options: [
    ['--tag [t]', 'Specify the DHIS2 Core version to use (a tag of hub.docker.com/u/amcgee/dhis2-backend)', 'dev'],
    ['--port [p]', 'Specify the port on which to expose the DHIS2 instance', '8080']
  ],
  run
};