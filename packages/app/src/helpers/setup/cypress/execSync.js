const { execSync: execSyncOrig } = require('child_process')

const execSync = cmd => {
    try {
        return execSyncOrig(cmd, { encoding: 'utf8' })
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

module.exports = execSync
