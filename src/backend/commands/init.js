const { cache, reporter } = require("../../util/commandant");

const backendGithubURL =
  "https://github.com/amcgee/dhis2-backend/archive/master.tar.gz";


const run = async ({ options }) => {
  reporter.info(`Downloading ${backendGithubURL}...`);
  try {
    const dir = await cache.fetchAndExtract(backendGithubURL, "backend", {
      force: options.force
    });
    reporter.info("DONE!", dir);
  } catch (e) {
    reporter.error('FAILED!');
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