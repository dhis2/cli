import { runProcesses } from './cypress_run/run_processes'
import { checkEnvFile } from './cypress_run/check_env_file'

const cypressRun = () => {
    checkEnvFile().then(runProcesses)
}
