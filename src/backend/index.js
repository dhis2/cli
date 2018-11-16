var program = require("commander");
const colors = require('colors');

var up = require('./commands/up');
var init = require("./commands/init");
const down = require('./commands/down');
const {
  collectConfigOptions,
} = require("../common/options");
const configLoader = require('../util/configLoader');
const CommandParser = require('../util/CommandParser');


program
  .version("0.1.0", "-v, --version")
  .description(
    "Command and control center for docker-based DHIS2 backend instances"
  )

collectConfigOptions()

const cmdResult = CommandParser.parse([ init, up, down ]);

program.parse(process.argv);

configLoader.load(program);
if (configLoader.config.verbose) {
  console.error(colors.blue(`${program._name} v${program._version}`));
}

if (cmdResult && cmdResult.run) {
  cmdResult.run(cmdResult);
} else {
  program.help();
}