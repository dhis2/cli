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

    validPackages.forEach(package => {
        package.label = package.json.name || '<unnamed>'
        if (!silent) {
            logger.log(`Package ${package.label} found at ${package.path}`)
        }
    })

    context.packages = validPackages
}

const replaceDependencies = (pkg, listNames, packageNames, version) => {
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
    const { silent, exact, updatePackageVersion = false } = config
    const { nextRelease, logger, packages } = context

    const targetVersion = exact
        ? nextRelease.version
        : `^${nextRelease.version}`

    const names = packages.map(package => package.json.name).filter(n => n)
    packages.forEach(package => {
        const pkgJson = package.json
        const relativePath = path.relative(context.cwd, package.path)

        if (updatePackageVersion) {
            pkgJson.version = nextRelease.version
            if (!silent) {
                logger.log(
                    `Updated version to ${nextRelease.version} for package ${
                        package.label
                    } at ${relativePath}`
                )
            }
        }

        replaceDependencies(
            pkgJson,
            ['dependencies', 'devDependencies', 'peerDependencies'],
            names,
            targetVersion
        ).forEach(
            dep =>
                !silent &&
                logger.log(
                    `Upgraded dependency ${dep}@${targetVersion} for ${
                        package.label
                    } at ${relativePath}`
                )
        )
        fs.writeFileSync(
            package.path,
            JSON.stringify(pkgJson, undefined, config.tabSpaces || 2) + '\n'
        )
    })
}

module.exports = { verifyConditions, prepare }
