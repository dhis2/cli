const { exec, reporter } = require('@dhis2/cli-helpers-engine')

const run = async function({ name, ...argv }) {
    try {
        await exec({
            cmd: 'docker',
            args: ['ps', '--filter', `name=${name}`],
            pipe: true,
            quiet: !argv.verbose,
        })
    } catch (e) {
        reporter.error("Failed to execute 'docker ps'", e)
        process.exit(1)
    }
}

module.exports = {
    command: 'status <name>',
    desc: 'Check the status of cluster containers',
    aliases: 's',
    handler: run,
}
