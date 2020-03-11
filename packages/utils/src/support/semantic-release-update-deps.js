const fs = require('fs')
const path = require('path')
const SemanticReleaseError = require('@semantic-release/error')
const AggregateError = require('aggregate-error')
const normalizeAndValidatePackages = require('./normalizeAndValidatePackages')

const verifyConditions = (config = {}, context) => {
    const { silent, packages } = config
    const { logger } = context
    if (!packages || !packages.length || packages.length < 2) {
        throw new SemanticReleaseError(
            'Invalid packages option',
            'EINVALIDPACKAGES',
            'You must pass at least two package directories to semantic-release-update-deps'
        )
    }

    const [validPackages, errors] = normalizeAndValidatePackages(packages)

    if (errors.length) {
        throw new AggregateError(errors)
    }

    validPackages.forEach(pkg => {
        pkg.label = pkg.json.name || '<unnamed>'
        if (!silent) {
            logger.log(`Package ${pkg.label} found at ${pkg.path}`)
        }
    })

    context.packages = validPackages
}

const replaceDependencies = ({ pkg, listNames, packageNames, version }) => {
    const dependencies = []
    packageNames.forEach(packageName => {
        listNames.forEach(listName => {
            if (pkg[listName] && pkg[listName][packageName]) {
                pkg[listName][packageName] = version
                dependencies.push(`${packageName} (${listName})`)
            }
        })
    })
    return dependencies
}

const prepare = (config, context) => {
    if (!context.packages) {
        verifyConditions({ ...config, silent: true }, context)
    }
    const { silent, exact, updatePackageVersion = true, tabSpaces = 4 } = config
    const { nextRelease, logger, packages } = context

    const targetVersion = exact
        ? nextRelease.version
        : `^${nextRelease.version}`

    const names = packages.map(pkg => pkg.json.name).filter(n => n)
    packages.forEach(pkg => {
        const pkgJson = pkg.json
        const relativePath = path.relative(context.cwd, pkg.path)

        if (updatePackageVersion) {
            pkgJson.version = nextRelease.version
            if (!silent) {
                logger.log(
                    `Updated version to ${nextRelease.version} for package ${pkg.label} at ${relativePath}`
                )
            }
        }

        replaceDependencies({
            pkg: pkgJson,
            listNames: ['dependencies', 'devDependencies', 'peerDependencies'],
            packageNames: names,
            version: targetVersion,
        }).forEach(
            dep =>
                !silent &&
                logger.log(
                    `Upgraded dependency ${dep}@${targetVersion} for ${pkg.label} at ${relativePath}`
                )
        )
        fs.writeFileSync(
            pkg.path,
            JSON.stringify(pkgJson, undefined, tabSpaces) + '\n'
        )
    })
}

module.exports = { verifyConditions, prepare }
