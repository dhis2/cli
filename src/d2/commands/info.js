const envInfo = require("envinfo");

const run = () => {
  envInfo.run(
    {
      System: ['OS', 'CPU', 'Memory', 'Shell'],
      Binaries: ['Node', 'Yarn', 'npm', 'docker-compose', 'docker'],
      Utilities: ['Git'],
      Virtualization: ['Docker', 'Docker Compose'],
      IDEs: ['VSCode', 'Sublime Text'],
      Databases: ['PostgreSQL'],
    },
    { console: true, showNotFound: true }
  );
}

module.exports = {
  name: 'info',
  alias: 'i',
  description: 'Get information about the system environment',
  run
}