const { namespace } = require('../util/cliUtils');

const command = namespace('d2', {
  desc: 'DHIS2 CLI',
  builder: yargs => {
    yargs.commandDir("commands");
    yargs.command(require('../d2-cluster'));
  }
});

module.exports = command;