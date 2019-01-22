const { namespace } = require('@dhis2/cli-utils');
const createApp = require("@dhis2/create-app");
const appScripts = require("./src/scripts");

module.exports = namespace("app", {
  desc: "Manage DHIS2 applications",
  aliases: 'a',
  commands: [
    createApp,
    appScripts,
  ]
});