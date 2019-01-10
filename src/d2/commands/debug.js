const { namespace } = require("../../util/cliUtils");

module.exports = namespace("debug", {
  desc: "Debug local d2 installation",
  builder: yargs => yargs.commandDir("debug"),
});
