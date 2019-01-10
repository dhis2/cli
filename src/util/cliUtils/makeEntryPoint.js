const chalk = require("chalk");
const defaultConfig = require("../configDefaults");
const cacheMiddleware = require("../cache/middleware");
const reporter = require("../reporter");
const { strings } = require('./');

module.exports = ({ desc, builder }) => {
  const yargs = require("yargs"); // singleton
  // TODO: Show description

  builder(yargs);
  yargs
    .demandCommand(1, strings.missingCommand)
    .recommendCommands();

  // Define global options
  yargs
    .env("D2")
    .help()
    .alias("h", "help")
    .version()
    .pkgConf('d2')
    .config(defaultConfig)
    .config("config", cfg => {
      const r = JSON.parse(fs.readFileSync(cfg));
      console.log(cfg, r);
      return r;
    });

  // Configure output
  yargs.wrap(72);

  yargs.updateStrings({
    "Options:": chalk.bold(`Options:`),
    "Commands:": chalk.bold("Commands:"),
    "Did you mean %s?": chalk.blue(`Did you mean ${chalk.bold("%s")}?`),
    "Not enough non-option arguments: got %s, need at least %s": chalk.red(
      "Missing required positional arguments (got %d of %d)"
    )
  });

  yargs.middleware([cacheMiddleware({ name: "d2" }), reporter.middleware()]);

  yargs.parse();

  return yargs;
}
