const { reporter, exec, chalk } = require('@dhis2/cli-helpers-engine')
const { makeComposeProject, listClusters } = require('../common')
const Table = require('cli-table3')

const getStatus = async cluster =>
    // TODO: check the status of the other services, not just `core`
    await exec({
        cmd: 'docker',
        args: [
            'ps',
            '-a', // Include stopped containers
            '--filter',
            `name=${makeComposeProject(cluster.name)}_core`,
            '--format',
            '{{.Status}}',
        ],
        pipe: false,
        captureOut: true,
    })

const formatStatus = status => {
    status = status.trim()

    if (status.length === 0) {
        return chalk.grey('Down')
    } else if (/\(Paused\)$/.test(status)) {
        return chalk.cyan(status)
    } else if (/^Up/.test(status)) {
        return chalk.green(status)
    } else if (/^Exited/.test(status)) {
        return chalk.red(status)
    } else {
        return chalk.yellow(status)
    }
}

const run = async function(argv) {
    const clusters = await listClusters(argv)

    const table = new Table({
        head: [
            'Name',
            'Port',
            'Channel',
            'DHIS2 Version',
            'DB Version',
            'Status',
        ],
    })

    await Promise.all(
        clusters.map(async cluster => {
            const status = await getStatus(cluster)
            table.push([
                chalk.blue(cluster.name),
                cluster.port,
                cluster.channel,
                cluster.dhis2Version,
                cluster.dbVersion,
                formatStatus(status),
            ])
        })
    )

    reporter.print(table)
}

module.exports = {
    command: 'list',
    desc: 'List all active cluster configurations',
    aliases: 'ls',
    handler: run,
}
