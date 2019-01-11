const { namespace } = require('../../util/cliUtils');

module.exports = namespace("app", {
  desc: "Manage DHIS2 applications",
  aliases: 'a',
  commands: [
    require('./app/create'),
    require('./app/scripts'),
  ]
});