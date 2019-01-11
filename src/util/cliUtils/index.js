const chalk = require("chalk");

module.exports.strings = {
  missingCommand: chalk.red(
    "You need at least one command before moving on."
  ),
  unrecognizedCommand: chalk.red(
    "Command not recognized..."
  )
}

const globalOptions = ["help", "version", "config"];
const groupGlobalOptions = yargs => {
  yargs.group(globalOptions, chalk.bold("Global Options"));
};
module.exports.groupGlobalOptions = groupGlobalOptions;

module.exports.namespace = require('./namespace');
module.exports.makeEntryPoint = require('./makeEntryPoint');
module.exports.notifyOfUpdates = require("./notifyOfUpdates");