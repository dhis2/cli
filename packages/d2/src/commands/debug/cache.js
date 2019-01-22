const fs = require('fs');
const chalk = require("chalk");
const { reporter } = require('@dhis2/cli-utils');
const inquirer = require('inquirer');
const Table = require("cli-table3");

const printStats = (table, name, stats) => {
  const nameColor = stats.isDirectory() ? chalk.blue : chalk.green;
  const mtime = stats.mtime.toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')
  table.push(
    [nameColor(name), stats.size, mtime]
  );
}

const parse = async ({ item = '/', getCache }) => {
  const cache = getCache();

  let loc;
  try {
    loc = cache.getCacheLocation(item); // Check that we have a valid argument!
  } catch (e) {
    reporter.debug(`getCacheLocation error: ${e}`);
    reporter.error(`Cache location ${chalk.bold(item)} is invalid.`);
  }

  const isRoot = loc === cache.getCacheLocation('/');
  const exists = await cache.exists(item);
  return {
    item,
    loc,
    isRoot,
    exists,
    cache
  }
}

const builder = yargs => {
  yargs.command('location [item]', 'Get the filesystem location of a cache item', {}, async argv => {
      const { loc } = await parse(argv);
      reporter.print(loc)
    }
  );

  yargs.command('list [item]', 'List cache items', {}, async argv => {
      const { item, cache, exists } = await parse(argv);
      if (!exists) {
        reporter.info(`Cached item ${chalk.bold(item)} does not exist`);
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
    }
  );

  yargs.command('status [item]', 'Get cache item status', {}, async argv => {
      const { item, exists, loc } = await parse(argv);
      reporter.print('CACHE STATUS');
      reporter.print(`\t${chalk.green.bold(item)}\t\t${exists ? `${chalk.blue.bold("EXISTS")}` : chalk.red.bold("DOES NOT EXIST")}\t@ ${loc}`);
    }
  );

  yargs.command('purge [item]', 'Purge cache item', {}, async argv => {
      const { item, isRoot, exists, cache } = await parse(argv);
      if (!exists) {
        reporter.info(`Cached item ${chalk.bold(item)} does not exist`);
        return;
      }
      const answers = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmed',
        message: `Are you sure you want to remove ${isRoot ? 'the ENTIRE d2 cache' : `cache item "${item}"`}?`,
        default: false,
      });
      if (!answers.confirmed) {
        return;
      }
      try {
        await cache.purge(item);
        reporter.info(`Purged cache item ${chalk.bold(item)}`);
      } catch (e) {
        reporter.debug(`Purge error: ${e}`);
        reporter.error(`Failed to purge cache item ${chalk.bold(item)}`);
      }
    }
  );

  yargs.demandCommand();
}

module.exports = {
  command: 'cache',
  desc: 'Inspect and control the application cache',
  builder,
}