const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

const runApp = () => {
    return new Promise((resolve, reject) => {
        const cypressEnvVars = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), 'cypress.env.json'), {
                enconding: 'utf8',
            })
        )

        const execution = spawn('yarn', ['start'], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                REACT_APP_DHIS2_BASE_URL: cypressEnvVars.LOGIN_URL,
            },
        })

        execution.stdout.on('data', data => {
            const message = data.toString()

            if (message.match(/Compiled successfully/)) {
                resolve()
            }

            if (message.match(/Compiled with warnings/)) {
                resolve()
            }

            if (message.match(/^Something is already running on port/)) {
                reject(message)
                execution.kill('SIGKILL')
            }

            if (message.match(/Failed to compile/)) {
                reject(message)
                execution.kill('SIGKILL')
            }
        })

        process.on('SIGINT', () => {
            execution.kill('SIGKILL')
            process.exit()
        })
    })
}

const runCypress = () => {
    const execution = spawn('yarn', ['cypress:open'], {
        cwd: process.cwd(),
        stdio: [process.stdin, process.stdout, process.stderr],
    })

    process.on('SIGINT', () => {
        execution.kill('SIGKILL')
        process.exit()
    })
}

module.exports = { runApp, runCypress }
