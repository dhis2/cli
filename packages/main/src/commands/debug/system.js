const { reporter } = require('@dhis2/cli-helpers-engine')
const envInfo = require('envinfo')

const run = async () => {
    const info = await envInfo.run(
        {
            System: ['OS', 'CPU', 'Memory', 'Shell'],
            Binaries: ['Node', 'Yarn', 'npm', 'docker'],
            Utilities: ['Git'],
            Virtualization: ['Docker', 'Docker Compose'],
            IDEs: ['VSCode', 'Sublime Text'],
            Databases: ['PostgreSQL'],
        },
        { showNotFound: true }
    )
    reporter.print(info)
}

module.exports = {
    command: 'system',
    desc: 'Print system environment information',
    handler: run,
}
