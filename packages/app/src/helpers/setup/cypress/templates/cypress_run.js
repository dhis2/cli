const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const envFiles = [
    '.env.develoment.local',
    '.env.develoment',
    '.env.local',
    '.env',
]

const getBaseUrl = () => {
    if (process.env.REACT_APP_DHIS2_BASE_URL) {
        return process.env.REACT_APP_DHIS2_BASE_URL
    }

    for (let i = 0, l = envFiles.length; i < l; ++i) {
        const envPath = path.join(__dirname, '..', envFiles[i])

        if (fs.fileExistsSync(envPath)) {
            const envContent = fs.readfileSync(envPath, { encoding: 'utf8' })
            const envValues = JSON.parse(envContent)

            if (envValues.REACT_APP_DHIS2_BASE_URL) {
                return envValues.REACT_APP_DHIS2_BASE_URL
            }
        }
    }

    return 'http://localhost:8000'
}

const concurrently = path.join(
    __dirname,
    '..',
    'node_modules',
    '.bin',
    'concurrently'
)
const waitOn = path.join(__dirname, '..', 'node_modules', '.bin', 'wait-on')
const cypress = path.join(__dirname, '..', 'node_modules', '.bin', 'cypress')

const execution = exec(`
    ${concurrently} '\
        yarn start' '\
        ${waitOn} http://localhost:3000 && \
        ${cypress} run \
            -b chromium \
            --env LOGIN_URL=${getBaseUrl()} \
        '
`)

execution.stdout.on('data', data => {
    const res = data.toString()

    if (res.match(/.*cypress run .* exited with code 0/)) {
        console.log('DONE!')
        process.exit(0)
    }
})
