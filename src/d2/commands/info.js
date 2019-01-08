const envInfo = require("envinfo");
const { reporter } = require('commandant');

const run = async () => {
  const info = await envInfo.run(
    {
      System: ['OS', 'CPU', 'Memory', 'Shell'],
      Binaries: ['Node', 'Yarn', 'npm', 'docker-compose', 'docker'],
      Utilities: ['Git'],
      Virtualization: ['Docker', 'Docker Compose'],
      IDEs: ['VSCode', 'Sublime Text'],
      Databases: ['PostgreSQL'],
    },
    { showNotFound: true }
  );
  reporter.print(info);
}

module.exports = {
  name: 'info',
  alias: 'i',
  description: 'Get information about the system environment',
  run
}