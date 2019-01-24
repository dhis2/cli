/** @format */

const path = require('path')

const log = require('@vardevs/log')({
    level: require('./loglevel.js'),
    prefix: 'deps',
})

const die = require('./die.js')

function findDependencies(deps, pkgs) {
    const res = []
    for (const dep of deps) {
        for (const pkg of pkgs) {
            if (dep === pkg.name) {
                res.push(pkg.name)
            }
        }
    }
    return res
}

function findDependents(name, pkgs) {
    const res = []
    for (const pkg of pkgs) {
        if (pkg.deps.includes(name)) {
            res.push(pkg.name)
        }
    }
    return res
}

function dep_graph(pkgs = []) {
    return pkgs
        .map(p => {
            const pkg = require(p)
            const { name, dependencies } = pkg

            const deps = dependencies ? Object.keys(dependencies) : []

            return {
                name,
                deps,
                path: path.dirname(p),
            }
        })
        .map((pkg, index, arr) => {
            const { name, deps } = pkg
            const hasDependents = findDependents(name, arr)
            const hasDependencies = findDependencies(deps, arr)
            return {
                name: name,
                dependents: hasDependents,
                depends: hasDependencies,
                path: pkg.path,
            }
        })
}

function empty(arr) {
    return arr.length === 0
}

function has_deps(pkg) {
    return !empty(pkg.depends)
}

function has_dependents(pkg) {
    return !empty(pkg.dependents)
}

function has_name(list, name) {
    for (const i of list) {
        if (i.name === name) {
            return true
        }
    }
    return false
}

function sort(deps) {
    const unsorted = new Set(deps)
    const resolved = new Set()
    let loop = 0
    while (true) {
        // avoid an infinite loop
        if (loop > 10000) {
            die(
                'Loop exceeded limit, probably a circular dependency in the graph!'
            )
        }

        log.debug('start iteration: unsorted', unsorted.size)
        log.debug('start iteration: resolved ', resolved.size)
        if (unsorted.size === 0) {
            log.debug('all resolved', resolved)
            return [...resolved]
        } else {
            for (const x of unsorted) {
                if (has_deps(x)) {
                    let satisfied = true
                    for (const d of x.depends) {
                        if (!has_name(resolved, d)) {
                            log.debug(`could not satisfy ${d} for ${x.name}`)
                            satisfied = false
                        }
                    }
                    if (satisfied) {
                        resolved.add(x)
                        unsorted.delete(x)
                        log.debug(`has deps: added ${x.name} to resolved`)
                    }
                } else {
                    resolved.add(x)
                    unsorted.delete(x)
                    log.debug(`easy case: added ${x.name} to resolved`)
                }
            }
            ++loop
            continue
        }
    }
}

function update(deps) {
    return deps
}

module.exports = {
    dep_graph,
    sort,
    update,
}
