// const { existsSync } = require('fs')
const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const semanticRelease = require('semantic-release')
const getWorkspacePackages = require('../support/getWorkspacePackages')

const packageIsPublishable = pkgJsonPath => {
    try {
        const pkgJson = require(pkgJsonPath)
        return !!pkgJson.name && !pkgJson.private
    } catch (e) {
        return false
    }
}

function publisher(target = '', packages) {
    switch (target.toLowerCase()) {
        case 'npm': {
            return packages.filter(packageIsPublishable).map(pkgJsonPath => {
                return [
                    '@semantic-release/npm',
                    {
                        pkgRoot: path.dirname(pkgJsonPath),
                    },
                ]
            })
        }

        default: {
            return packages.map(pkgJsonPath => {
                return [
                    '@semantic-release/npm',
                    {
                        pkgRoot: path.dirname(pkgJsonPath),
                        npmPublish: false,
                    },
                ]
            })
        }
    }
}

const handler = async ({ publish }) => {
    // set up the plugins and filter out any undefined elements

    const rootPackageFile = path.join(process.cwd(), 'package.json')
    const packages = [
        rootPackageFile,
        ...(await getWorkspacePackages(rootPackageFile)),
    ]

    const updateDepsPlugin =
        packages.length > 1
            ? [
                  require('../support/semantic-release-update-deps'),
                  {
                      exact: true,
                      packages,
                  },
              ]
            : undefined

    const changelogPlugin = [
        '@semantic-release/changelog',
        {
            changelogFile: 'CHANGELOG.md',
        },
    ]

    // const gitPlugin = [
    //     '@semantic-release/git',
    //     {
    //         assets: [
    //             'CHANGELOG.md',
    //             packages.map(pkgJsonPath =>
    //                 path.relative(process.cwd(), pkgJsonPath)
    //             ),
    //             packages
    //                 .map(pkgJsonPath =>
    //                     path.join(path.dirname(pkgJsonPath), 'pnpm-lock.yaml')
    //                 )
    //                 .filter(existsSync)
    //                 .map(pkgJsonPath =>
    //                     path.relative(process.cwd(), pkgJsonPath)
    //                 ),
    //         ],
    //         message:
    //             'chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
    //     },
    // ]

    const deferPlugin = require('../support/semantic-release-defer-release')

    // Order matters here!
    const plugins = [
        deferPlugin,
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        updateDepsPlugin,
        changelogPlugin,
        ...publisher(publish, packages),
        // gitPlugin,
        '@semantic-release/github',
    ]

    /* rely on defaults for configuration, except for plugins as they
     * need to be custom.
     *
     * https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md
     */
    const options = {
        plugins: plugins.filter(n => !!n),
    }

    const config = {
        env: {
            ...process.env,
            NPM_CONFIG_ALLOW_SAME_VERSION: 'true', // Ensure we still publish even though we've already updated the package versions
        },
    }

    try {
        const result = await semanticRelease(options, config)

        if (result) {
            const { lastRelease, commits, nextRelease, releases } = result

            if (nextRelease) {
                reporter.info(
                    `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`
                )
            }

            if (lastRelease) {
                reporter.info(`The last release was "${lastRelease.version}".`)
            }

            for (const release of releases) {
                reporter.info(
                    `The release was published with plugin "${release.pluginName}".`
                )
            }
        } else {
            reporter.info('No release published.')
        }
    } catch (err) {
        reporter.error(`The automated release failed with ${err}`)
        process.exit(1)
    }
}

module.exports = {
    command: 'release',
    desc: 'Execute the release process',
    aliases: 'r',
    handler,
    builder: {
        publish: {
            type: 'string',
            aliases: 'p',
        },
    },
}

// handler({ publish: 'npm' })
