const std_version = require('standard-version')

const exec = require('@dhis2/cli-helpers-engine').exec
const log = require('@dhis2/cli-helpers-engine').reporter

const fs = require('fs')
const path = require('path')

exports.command = 'release [options]'

exports.describe = `Generate change logs, tags, etc.

We use [standard-version](https://github.com/conventional-changelog/standard-version) to generate release information.

To do a subsequent release, run 'd2-app release'.

After that run 'git push --follow-tags origin master'.

DO NOT RUN 'npm publish'. Travis does this when it builds a tag.
`

exports.builder = {
    prerelease: {
        type: 'string',
        describe:
            'Use to cut a prerelease version, suffix can be a string e.g. "beta"',
    },
    'first-release': {
        type: 'boolean',
        describe: 'First time generation of a changelog',
        default: false,
    },
    'dry-run': {
        type: 'boolean',
        describe: 'Do release steps but do not commit to results',
        default: false,
    },
    silent: {
        type: 'boolean',
        describe: 'Suppress output.',
        default: false,
        alias: ['q'],
    },
}

exports.handler = async function(argv) {
    const repoDir = process.cwd()

    if (!argv.firstRelease) {
        try {
            fs.accessSync(path.join(repoDir, 'CHANGELOG.md'))
        } catch (e) {
            log.error(
                `'${repoDir}/CHANGELOG.md' does not exist, and command was called without '--first-release'.`
            )
            process.exit(1)
        }
    }

    const options = {
        noVerify: true,
        infile: `${repoDir}/CHANGELOG.md`,
        silent: argv.silent,
        dryRun: argv.dryRun,
        message: 'chore(release): cut release %s',
        tagPrefix: '',
        firstRelease: argv.firstRelease,
        prerelease: argv.prerelease,
    }

    try {
        await std_version(options, function(err) {
            if (err) {
                log.error(
                    `standard-version failed with message: ${err.message}`
                )
            }
            // standard-version is done
        })
    } catch (e) {
        log.error('standard-version failed', e)
        process.exit(1)
    }
}
