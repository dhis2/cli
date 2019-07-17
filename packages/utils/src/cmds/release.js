const { reporter } = require('@dhis2/cli-helpers-engine')
const { existsSync } = require('fs')
const path = require('path')
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
            return [undefined]
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

    const gitPlugin = [
        '@semantic-release/git',
        {
            assets: [
                'CHANGELOG.md',
                'docs',
                packages.map(pkgJsonPath =>
                    path.relative(process.cwd(), pkgJsonPath)
                ),
                packages
                    .map(pkgJsonPath =>
                        path.join(path.dirname(pkgJsonPath), 'yarn.lock')
                    )
                    .filter(existsSync)
                    .map(pkgJsonPath =>
                        path.relative(process.cwd(), pkgJsonPath)
                    ),
            ],
            message:
                'chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
    ]

    // Order matters here!
    const plugins = [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        updateDepsPlugin,
        changelogPlugin,
        ...publisher(publish, packages),
        gitPlugin,
        '@semantic-release/github',
    ]

    const options = {
        branch: 'master',
        version: 'v${version}',
        plugins: plugins.filter(n => !!n),
    }

    const config = {
        env: {
            ...process.env,
            GIT_AUTHOR_NAME: '@dhis2-bot',
            GIT_AUTHOR_EMAIL: 'ci@dhis2.org',
            GIT_COMMITTER_NAME: '@dhis2-bot',
            GIT_COMMITTER_EMAIL: 'ci@dhis2.org',
            NPM_CONFIG_ALLOW_SAME_VERSION: 'true', // Ensure we still publish even though we've already updated the pacakge versions
        },
    }

    try {
        const result = await semanticRelease(options, config)

        if (result) {
            const { lastRelease, commits, nextRelease, releases } = result

            reporter.info(
                `Published ${nextRelease.type} release version ${nextRelease.version} containing ${commits.length} commits.`
            )

            if (lastRelease.version) {
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
