const { groupGlobalOptions } = require("../../../util/cliUtils");

module.exports = {
  command: "create [type]",
  desc: "Create a new DHIS2 front-end app",
  builder: yargs => {
    groupGlobalOptions(yargs);
    yargs.option('silent')
  },
  handler: argv => {
    console.log('CREATE', argv)
  }
};
