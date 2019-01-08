const { config, reporter } = require('commandant');

const run = ({ options }) => {
  reporter.print(JSON.stringify(config, null, options.format ? 2 : null));
}

module.exports = {
  name: 'config',
  options: [
    ['--no-format', 'Don\'t print whitespace or line breaks.']
  ],
  run
}