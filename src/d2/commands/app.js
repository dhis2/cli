const { namespace } = require('../../util/cliUtils');

module.exports = namespace("app", {
  desc: "Manage DHIS2 applications",
  commands: [
    require('./app/create'),
    require('./app/scripts'),
  ]
  // builder: yargs => yargs.commandDir("app"),
});