const { runApp, runCypress } = require('./cypress_run/run_processes')
const checkEnvFile = require('./cypress_run/check_env_file')

checkEnvFile()
    .then(() => console.info('Starting application'))
    .then(runApp)

    .then(() => console.info('Application started, starting cypress'))
    .then(runCypress)

    .catch(console.error)
