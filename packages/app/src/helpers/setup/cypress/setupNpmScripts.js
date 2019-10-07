const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const path = require('path')
const execSync = require('./execSync')
const mkdir = require('./mkdir')
const copy = require('./copy')
const { TEMPLATE_PATH } = require('./constants')

const setupNpmScripts = rootDir => {
    const scriptTargetDir = path.join(rootDir, 'scripts')
    const scriptTargetDirExists = fs.existsSync(scriptTargetDir)
    const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), {
            enconding: 'utf8',
        })
    )

    reporter.debug('Installing concurrently node module')
    execSync(`cd ${rootDir} && yarn add -D concurrently`)

    if (!scriptTargetDirExists) {
        mkdir(rootDir, `scripts`)
    } else if (
        scriptTargetDirExists &&
        !fs.statSync(scriptTargetDir).isDirectory()
    ) {
        reporter.error(`${scriptTargetDir} exists but needs to be a directory`)
        process.exit(1)
    }

    copy({
        fromPath: TEMPLATE_PATH,
        fromName: 'cypress_run.js',
        toRootDir: rootDir,
        toFilePath: 'scripts/cypress_run.js',
    })

    copy({
        fromPath: TEMPLATE_PATH,
        fromName: 'cypress_run',
        toRootDir: rootDir,
        toFilePath: 'scripts/cypress_run',
    })

    const packageJsonWithScripts = {
        ...packageJson,
        scripts: {
            ...packageJson.scripts,
            'cypress:open': 'cypress open',
            'cypress:start': 'node scripts/cypress_run.js',
        },
    }

    fs.writeFileSync(
        path.join(rootDir, 'package.json'),
        JSON.stringify(packageJsonWithScripts, null, 2)
    )
}

module.exports = setupNpmScripts
