var program = require('commander');
const colors = require('colors');
const configLoader = require('../util/configLoader');
const { parse } = require('../util/CommandParser');

program
  .version('0.1.0', '-v, --version')
  .description('Codified workflow for DHIS2 development, testing, and staging')

const cmdResult = parse([
  require('./commands/info'),
  require('./commands/config'),
  {
    name: 'backend',
  }
]);

// program.on('option:verbose', verbose => {
//   console.log('vb');
//   configLoader.config.verbose = verbose;
// });

// program
//   .command("backend", "control local docker-based backend clusters")
//   .alias("b");

program
  .parse(process.argv);

configLoader.load(program);
if (configLoader.config.verbose) {
  console.error(colors.blue(`${program._name} v${program._version}`));
}

if (program.runningCommand) {
  return;
} else if (cmdResult && cmdResult.run) {
  cmdResult.run({ args: cmdResult.args, options: cmdResult.options, unknown: cmdResult.unknown });
} else {
  program.help();
}