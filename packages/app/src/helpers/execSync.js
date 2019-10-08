const { execSync: execSyncOrig } = require('child_process')

const execSync = (cmd, verbose) => {
    try {
        return execSyncOrig(cmd, {
            encoding: 'utf8',
            stdio: verbose
                ? [process.stdin, process.stdout, process.stderr]
                : 'ignore',
        })
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

module.exports = execSync
