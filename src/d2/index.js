const commandant = require('../util/commandant');
const config = require('../util/configDefaults');

commandant.init({
  version: '0.1.0',
  description: 'Command and control center for docker-based DHIS2 backend instances',
  commands: [
    require('./commands/info'),
    require('./commands/config'),
    { name: 'backend', alias: 'b' },
  ],
  config
});

commandant.parse(process.argv);