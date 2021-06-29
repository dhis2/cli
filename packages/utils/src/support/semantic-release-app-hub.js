const fs = require('fs')
const path = require('path')
const { publishCommand } = require('@dhis2/cli-app-scripts')
const SemanticReleaseError = require('@semantic-release/error')

const { handler: publishAppHub } = publishCommand

exports.verifyConditions = (config, context) => {
    const { env } = context
    const { pkgRoot } = config

    const configPath = path.join(pkgRoot, 'd2.config.js')

    if (!fs.existsSync(configPath)) {
        throw new SemanticReleaseError(
            `Failed to locate d2.config.js file, does it exist in ${pkgRoot}?`,
            'EMISSINGD2CONFIG',
            'd2.config.js is necessary to automatically publish to the App Hub'
        )
    }

    const d2Config = require(configPath)

    if (d2Config.type === 'lib') {
        throw new SemanticReleaseError(
            'App Hub does not support publishing libraries.',
            'EAPPHUBSUPPORT',
            "The type in d2.config.js must not be 'lib'"
        )
    }

    if (!d2Config.id) {
        throw new SemanticReleaseError(
            "'id' field missing from d2.config.js",
            'EMISSINGAPPHUBID',
            'The App Hub application id must be defined in d2.config.js'
        )
    }

    if (!d2Config.minDHIS2Version) {
        throw new SemanticReleaseError(
            "'minDHIS2Version' field missing from d2.config.js",
            'EMISSINGMINDHIS2VERSION',
            'The minimum supported DHIS2 version must be defined in d2.config.js'
        )
    }

    if (!env.APP_HUB_TOKEN) {
        throw new SemanticReleaseError(
            'APP_HUB_TOKEN is missing from the environment',
            'EMISSINGAPPHUBTOKEN',
            'You need to supply the API token to the APP_HUB_TOKEN env var.'
        )
    }
}

// maybe we can use this step for release channels
// exports.addChannel = (config, context) => {}

exports.publish = async (config, context) => {
    const { pkgRoot } = config
    const { env, logger } = context

    const d2Config = require(path.join(pkgRoot, 'd2.config.js'))
    const pkg = require(path.join(pkgRoot, 'package.json'))

    logger.log(d2Config)
    logger.log(pkg)

    const fileVersion = pkg.version
    const file = `dhis2-${d2Config.name}-${fileVersion}.zip`

    await publishAppHub({
        cwd: pkgRoot,
        apikey: env.APP_HUB_TOKEN,
        id: d2Config.id,
        minDHIS2Version: d2Config.minDHIS2Version,
        baseUrl: 'https://apps.dhis2.org',
        channel: 'stable',
        file,
        fileVersion,
    })
}

exports.success = (config, context) => {
    const { logger } = context

    logger.log('Published successfully to the App Hub')
}

exports.fail = (config, context) => {
    const { logger } = context

    logger.log('Published to the App Hub failed')
}
