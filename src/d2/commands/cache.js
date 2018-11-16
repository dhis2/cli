const fs = require('fs');
const colors = require("colors");
const { cache, reporter } = require('../../util/commandant');

const run = ({ args }) => {
  const [ item = '/' ] = args;
  loc = cache.getCacheLocation(item)
  reporter.print('CACHE STATUS');
  reporter.print(`\t${colors.green.bold(item)}\t\t${fs.existsSync(loc) ? `${colors.blue.bold('EXISTS')}\t@ ${loc}` : colors.red.bold('DOES NOT EXIST')}`);
}

module.exports = {
  name: 'cache [item]',
  description: 'Inspect the status of a particular item in the cache',
  run
}