const { namespace } = require('../util/cliUtils');

const command = namespace("cluster", {
  desc: "Manage DHIS2 Docker clusters",
  aliases: 'c',
  builder: yargs => {
    yargs.commandDir("commands");
  }
});

module.exports = command;