const colors = require("colors");
// const config = require("./ConfigLoader").config;
const util = require('util');

const config = {
  verbose: false,
  quiet: false,
}
const middleware = ({ verboseOption = 'verbose', quietOption = 'quiet' } = {}) => argv => {
  if (!!argv[verboseOption]) {
    config.verbose = true;
  }
  if (!!argv[quietOption]) {
    config.quiet = true;
  }
}

const levels = [
  {
    name: "debug",
    verbose: true,
    stderr: true,
    msgEnhancer: msg => `${"[DEBUG]".bold.gray} ${colors.gray(msg)}\n`
  },
  {
    name: "info",
    verbose: false,
    stderr: true,
    msgEnhancer: msg => `${colors.cyan(msg)}\n`
  },
  {
    name: "dump",
    verbose: true,
    quiet: true,
    msgEnhancer: msg => colors.gray(`${msg}`)
  },
  {
    name: "dumpErr",
    verbose: true,
    stderr: true,
    msgEnhancer: msg => colors.bgRed(`${msg}`)
  },
  {
    name: "print",
    verbose: false,
    quiet: true,
    msgEnhancer: msg => `${msg}\n`
  },
  {
    name: "warn",
    verbose: false,
    stderr: true,
    msgEnhancer: msg => `${"[WARNING]".bold.yellow} ${colors.yellow(msg)}\n`
  },
  {
    name: "printErr",
    verbose: false,
    stderr: true,
    msgEnhancer: msg => `${msg}\n`
  },
  {
    name: "error",
    verbose: false,
    stderr: true,
    msgEnhancer: msg => `${"[ERROR]".bold.red} ${colors.red(msg)}\n`
  }
];

const shouldLog = (lvl) => (
  !lvl.verbose || config.verbose !== false // If config.verbose is still undefined we shouldn't suppress logs
) && (
    !config.quiet || lvl.quiet === true
  );

const write = (lvl = {}, msg, args) => {
  if (shouldLog(lvl)) {
    msg = `${msg} ${args.length ? util.format.apply(this, args) : ""}`;
    if (lvl.msgEnhancer) {
      msg = lvl.msgEnhancer(msg);
    }
    if (args.length && msg.slice(-1) !== '\n') {
      msg += '\n'
    }
    if (lvl.stderr) {
      process.stderr.write(msg);
    } else {
      process.stdout.write(msg);
    }
  }
};
const reporter = {};

levels.forEach(lvl => {
  reporter[lvl.name] = (msg, ...args) => write(lvl, msg, args);
});

reporter.middleware = middleware

module.exports = reporter;
