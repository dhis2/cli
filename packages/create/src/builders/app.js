const { reporter, chalk } = require('@dhis2/cli-helpers-engine')

const buildApp = async ({ name, ...argv }) => {
    reporter.info(
        `Hold your horses!  DHIS2 application bootstrapping with ${chalk.bold(
            'd2 create app'
        )} is coming soon...`
    )
}

module.exports = buildApp
