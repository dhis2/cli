const { spawn } = require("child_process");
const chalk = require('chalk');
const reporter = require('./reporter');

module.exports = function ({ cmd, args, ...opts }) {
  reporter.info(`> ${cmd} ${args.join(' ')}`);
  const label = chalk.bold(`<${cmd}> `);

  const env = {
    ...process.env,
    ...opts.env,
  };
  // reporter.debug(`env: ${JSON.stringify(env)}`);
  
  const p = new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      ...opts,
      env
    });

    // let stdoutStarted = false, stderrStarted = false;
    
    child.stdout.on('data', data => {
      // if (!stdoutStarted) reporter.dump(label);
      // else stdoutStarted = true
      reporter.dump(data);//.replace(/(\n+).+/, `$1${label}`));
    });

    child.stderr.on('data', data => {
      // if (!stderrStarted) reporter.dump(label);
      // else stderrStarted = true
      reporter.dumpErr(data);//.replace(/(\n+).+/, `$1${label}`).red);
    });

    child.on('close', code => {
      if (code !== 0) {
        reporter.error(`${chalk.bold(cmd)} exited with non-zero exit code (${code}).`);
        reject();
      } else {
        reporter.info(`${chalk.bold(cmd)} completed successfully.`);
        resolve();
      }
    })
  })

  return p;
}