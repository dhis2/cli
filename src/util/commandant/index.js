const commander = require('commander');
const colors = require("colors");

const CommandParser = require('./CommandParser');
const ConfigLoader = require('./ConfigLoader');

const reporter = require('./reporter');
const cache = require('./cache');

class Commandant {
  init(opts) {
    this._initOpts = opts;
    const { version, versionFormat, description, commands, config } = opts;

    commander
      .version(version, versionFormat || "-v, --version")
      .description(description);

    this.cmdResult = CommandParser.parse(commands);
  }

  parse(argv) {
    const { version, versionFormat, description, commands, config } = this._initOpts;
    
    commander.parse(process.argv);

    ConfigLoader.load(config, commander);
    
    if (!this.cmdResult.isSubCommand) {
      reporter.info(`>>>   ${colors.bold(`${commander._name} v${version}`)}   <<<`);
    }

    if (this.cmdResult && this.cmdResult.run) {
      this.cmdResult.run(this.cmdResult);
    } else {
      commander.help();
    }
  }
}

module.exports = new Commandant()

module.exports.cache = cache;
module.exports.config = ConfigLoader.config;
module.exports.reporter = reporter;