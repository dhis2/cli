const fs = require('fs');
const colors = require("colors");
const { cache, reporter } = require('commandant');
const inquirer = require('inquirer');
const Table = require("cli-table");

const printStats = (table, name, stats) => {
  const nameColor = stats.isDirectory() ? colors.red : colors.green;
  const mtime = stats.mtime.toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')
  table.push(
    [nameColor(name), stats.size, mtime]
  );
}

const run = async ({ args }) => {
  const cmd = args[0];
  const item = args[1] || '/';

  let loc;
  try {
    loc = cache.getCacheLocation(item); // Check that we have a valid argument!
  } catch (e) {
    reporter.debug(`getCacheLocation error: ${e}`);
    reporter.error(`Cache location ${colors.bold(item)} is invalid.`);
  }

  const isRoot = loc === cache.getCacheLocation('/');
  const exists = await cache.exists(item);

  switch (cmd) {
    case 'location':
      reporter.print(loc);
      break;
    case 'list':
      if (!exists) {
        reporter.info(`Cached item ${colors.bold(item)} does not exist`);
        return;
      }
      const stat = await cache.stat(item);
      const table = new Table({
        head: ['Name', 'Size', 'Modified']
      });
      if (stat.children) {
        Object.keys(stat.children).forEach(name => {
          printStats(table, name, stat.children[name]);
        });
      } else {
        printStats(table, stat.name, stat.stats);
      }
      reporter.print(table);
      break;
    case 'status':
      reporter.print('CACHE STATUS');
      reporter.print(`\t${colors.green.bold(item)}\t\t${exists ? `${colors.blue.bold("EXISTS")}` : colors.red.bold("DOES NOT EXIST")}\t@ ${loc}`);
      break;
    case 'purge':
      if (!exists) {
        reporter.info(`Cached item ${colors.bold(item)} does not exist`);
        return;
      }
      const answers = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmed',
        message: `Are you sure you want to remove ${isRoot? 'the ENTIRE d2 cache' : `cache item "${item}"`}?`,
        default: false,
      });
      if (!answers.confirmed) {
        return;
      }
      try {
        await cache.purge(item);
        reporter.info(`Purged cache item ${colors.bold(item)}`);
      } catch (e) {
        reporter.debug(`Purge error: ${e}`);
        reporter.error(`Failed to purge cache item ${colors.bold(item)}`);
      }
      break;
    default:
      reporter.error(`Unknown command ${colors.bold('cache ' + cmd)}, try ${colors.bold('status')} or ${colors.bold('purge')}`);
      process.exit(1);
  }
}

module.exports = {
  name: 'cache <cmd> [item]',
  description: 'Inspect and control the application cache',
  run
}