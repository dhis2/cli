const { reporter } = require('@dhis2/cli-helpers-engine')

const semanticRelease = require('semantic-release')

function publisher(target = '') {
    switch (target.toLowerCase()) {
        case 'npm': {
            return '@semantic-release/npm'
        }

        default: {
            return undefined
        }
    }
}

const handler = async ({ name, publish }) => {
    // set up the plugins and filter out any undefined elements
    const plugins = [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',

        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md',
            },
        ],

        publisher(publish),

        [
            '@semantic-release/git',
            {
                assets: ['CHANGELOG.md', 'package.json', 'yarn.lock'],
                message:
                    'chore(release): cut ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            },
        ],

        '@semantic-release/github',
    ].filter(n => n)

    const options = {
        branch: 'master',
        version: 'v${version}',
        plugins: plugins,
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
