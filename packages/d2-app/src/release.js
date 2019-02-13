const std_version = require('standard-version')

const exec = require('@dhis2/cli-helpers-engine').exec
const log = require('@dhis2/cli-helpers-engine').reporter

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
        default: true,
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

    log.info(`i'm in ${repoDir}, what up?`)

    const options = {
        noVerify: true,
        infile: `${repoDir}/CHANGELOG.md`,
        silent: argv.silent,
        dryRun: argv.dryRun,
        message: 'chore(release): cut release %s',
        tagPrefix: '',
        firstRelease: argv.firstRelease,
        prerelease: argv.prerelease,
        skip: {
            tag: true,
        },
    }

    try {
        const foo = await exec({
            cmd: 'echo',
            args: ['boo'],
            opts: [],
        })
        log.info(foo)
    } catch (e) {
        log.error('exec borked', e)
    }

    try {
        await std_version(options, function(err) {
            if (err) {
                console.error(
                    `standard-version failed with message: ${err.message}`
                )
            }
            // standard-version is done
        })
    } catch (e) {
        console.error('BOOM!', e)
    }
}
