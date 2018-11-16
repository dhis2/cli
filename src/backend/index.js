const commandant = require('../util/commandant');
const config = require('../util/configDefaults');

var up = require('./commands/up');
var init = require("./commands/init");
const down = require('./commands/down');

commandant.init({ 
  version: '0.1.0',
  description: 'Command and control center for docker-based DHIS2 backend instances',
  commands: [ init, up, down ],
  config
});

commandant.parse(process.argv);