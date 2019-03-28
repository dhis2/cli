const path = require('path')
const installTemplate = require('../installTemplate')
const { reporter } = require('@dhis2/cli-helpers-engine')
const chalk = require('chalk')

const buildApp = async ({ name, ...argv }) => {
    const data = { basename: name || 'myApp' }
    reporter.info(
        `Hold your horses!  DHIS2 application bootstrapping with ${chalk.bold(
            'd2 create app'
        )} is coming soon...`
    )
    // reporter.info(`Creating DHIS2 application ${chalk.bold(data.basename)}...`)

    // const dest = path.join(process.cwd(), data.basename)
    // await installTemplate('app', dest, data)
}

module.exports = buildApp
