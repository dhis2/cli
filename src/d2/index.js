const command = {
  command: "d2",
  desc: '',
  builder: yargs => {
    yargs.commandDir("commands");
    yargs.command(require('../d2-cluster'));
  }
};

module.exports = command;