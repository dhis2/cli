const { reporter } = require('@dhis2/cli-helpers-engine')

const { readdirSync } = require('fs')
const { join } = require('path')

const semanticRelease = require('semantic-release')

function publisher(target = '') {
    switch (target.toLowerCase()) {
        case 'npm': {
            return ['@semantic-release/npm']
        }

        case 'mono-npm': {
            const packages = readdirSync('./packages')
            return packages.map(p => {
                return [
                    '@semantic-release/npm',
                    {
                        pkgRoot: join('./packages', p),
                    },
                ]
            })
        }

        default: {
            return [undefined]
        }
    }
}

const handler = async ({ name, publish }) => {
    // set up the plugins and filter out any undefined elements

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
                'package.json',
                'yarn.lock',
                'packages/**/package.json',
                'packages/**/yarn.lock',
            ],
            message:
                'chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
    ]

    const plugins = [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        changelogPlugin,
        ...publisher(publish),
        gitPlugin,
        // '@semantic-release/github',
    ]

    const options = {
        branch: 'master',
        version: 'v${version}',
        plugins: plugins.filter(n => n),
    }

    const config = {
        env: {
            ...process.env,
            GIT_AUTHOR_NAME: '@dhis2-bot',
            GIT_AUTHOR_EMAIL: 'ci@dhis2.org',
            GIT_COMMITTER_NAME: '@dhis2-bot',
            GIT_COMMITTER_EMAIL: 'ci@dhis2.org',
        },
    }

    try {
        const result = await semanticRelease(options, config)

        if (result) {
            const { lastRelease, commits, nextRelease, releases } = result

            reporter.info(
                `Published ${nextRelease.type} release version ${
                    nextRelease.version
                } containing ${commits.length} commits.`
            )

            if (lastRelease.version) {
                reporter.info(`The last release was "${lastRelease.version}".`)
            }

            for (const release of releases) {
                reporter.info(
                    `The release was published with plugin "${
                        release.pluginName
                    }".`
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
