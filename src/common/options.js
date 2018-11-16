const program = require('commander');
const reporter = require('../util/reporter');

module.exports.collectConfigOptions = () => {
  return program
    .option('--verbose', 'Log all the things')
    .option('--config <file>', 'Specify a custom config file');
}