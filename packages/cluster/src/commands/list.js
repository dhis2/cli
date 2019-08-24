const chalk = require('chalk')
const path = require('path')
const { reporter, exec, tryCatchAsync } = require('@dhis2/cli-helpers-engine')
const { makeComposeProject, listClusters } = require('../common')
const Table = require('cli-table3')

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
            let status = await exec({
                cmd: 'docker',
                args: [
                    'ps',
                    '--filter',
                    `name=${makeComposeProject(cluster.name)}_core`,
                    '--format',
                    '{{.Status}}',
                ],
                pipe: false,
                captureOut: true,
            })

            if (status.length === 0) {
                status = chalk.grey('Down')
            } else if (/\(Paused\)/.test(status)) {
                status = chalk.cyan(status)
            } else if (/$Up \d+/.test(status)) {
                status = chalk.green(status)
            } else {
                status = chalk.yellow(status)
            }
            cluster.status = status
        })
    )

    clusters.forEach(cluster =>
        table.push([
            chalk.blue(cluster.name),
            cluster.port,
            cluster.channel,
            cluster.dhis2Version,
            cluster.dbVersion,
            cluster.status.trim(),
        ])
    )

    reporter.print(table)
}

module.exports = {
    command: 'list',
    desc: 'List all active cluster configurations',
    aliases: 'ls',
    handler: run,
}
