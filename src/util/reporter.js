const colors = require("colors");
const config = require("./config");

const levels = [
  {
    name: "dump",
    verbose: true,
    msgEnhancer: msg => `${msg}`.gray
  },
  {
    name: "debug",
    verbose: true,
    msgEnhancer: msg => `${"[DEBUG]".bold.gray} ${colors.gray(msg)}\n`
  },
  {
    name: "info",
    verbose: false,
    msgEnhancer: msg => `${colors.cyan(msg)}\n`
  },
  {
    name: "print",
    verbose: false,
    msgEnhancer: msg => `${msg}\n`
  },
  {
    name: "warn",
    verbose: false,
    msgEnhancer: msg => `${"[WARNING]".bold.yellow} ${colors.yellow(msg)}\n`
  },
  {
    name: "dumpErr",
    verbose: true,
    stderr: true,
    msgEnhancer: msg => `${msg}`.gray
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
    msgEnhancer: msg => `${"[ERROR]".bold.red} ${msg.red}\n`
  }
];

const write = (lvl = {}, msg) => {
  // console.log("write-pre", lvl, msg, config);
  if (!lvl.verbose || config.verbose) {
    // console.log("write", msg);
    if (lvl.msgEnhancer) {
      msg = lvl.msgEnhancer(msg);
    }
    // console.log('write-post');
    if (lvl.stderr) {
      // console.log("write-err", msg);
      process.stderr.write(msg);
    } else {
      // console.log("write-out", msg);
      process.stdout.write(msg);
    }
  }
};
const reporter = {};

levels.forEach(lvl => {
  reporter[lvl.name] = (msg) => write(lvl, msg);
});

module.exports = reporter;
