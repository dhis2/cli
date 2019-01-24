const std_version = require('standard-version')
const getContext = require('../getContext')

exports.command = 'release [options]'

exports.describe = 'Generate CHANGELOG.md based on Git history.'

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
    const { root_dir } = await getContext()

    const options = {
        noVerify: true,
        infile: `${root_dir}/CHANGELOG.md`,
        silent: argv.silent,
        dryRun: argv.dryRun,
        message: 'chore(release): cut release %s',
        tagPrefix: '',
        firstRelease: argv.firstRelease,
        prerelease: argv.prerelease,
    }

    std_version(options, function(err) {
        if (err) {
            console.error(
                `standard-version failed with message: ${err.message}`
            )
        }
        // standard-version is done
    })
}
