const path = require('path')
const mkdirp = require('mkdirp')
const os = require('os')

const reporter = require('../reporter') // TODO: generalize

const { rimraf, exists, readdir, stat, rename } = require('./fsAsync')
const fetchAndExtract = require('./fetchAndExtract')

class Cache {
    constructor({ name, cacheRoot }) {
        if (cacheRoot) {
            this.cacheRoot = cacheRoot
        } else if (name) {
            this.cacheRoot = path.join(os.homedir(), '.cache', name)
        } else {
            throw new Error(
                'Either name or cacheDir must be specified to Cache initializer'
            )
        }

        mkdirp(this.baseDir)
    }

    async exists(pathname) {
        return await exists(this.getCacheLocation(pathname))
    }

    get baseDir() {
        return path.join(this.cacheRoot, 'cache')
    }

    get tmpDir() {
        return path.join(this.cacheRoot, '.tmp')
    }

    getCacheLocation(pathname) {
        const loc = path.join(this.baseDir, pathname)
        if (loc.indexOf(this.baseDir) !== 0) {
            throw new Error(
                'Cache items must be within the cache directory, relative paths are not allowed.'
            )
        }
        return loc
    }

    async makeTmp() {
        await mkdirp(this.tmpDir)
        return path.join(this.tmpDir, `/${Math.ceil(Math.random() * 100000)}`)
    }

    async get(url, name, { force, raw } = {}) {
        const parentDir = '/'
        const outLoc = this.getCacheLocation(`${parentDir}/${name}`)
        const tmpLoc = await this.makeTmp()

        if (force) {
            reporter.debug(`[CACHE] Forcing re-fetch of ${name}, ${outLoc}`)
            await rimraf(outLoc)
        } else if (await exists(outLoc)) {
            reporter.debug(`[CACHE] Cache hit at ${outLoc}`)
            return outLoc
        }

        try {
            await fetchAndExtract({
                url,
                name,
                tmpLoc,
                outLoc,
                raw,
            })
        } catch (e) {
            console.log(e)
            reporter.debug(`[CACHE] fetchAndExtract error: ${e}`)
            throw `Failed to fetch ${name}`
        }
        return outLoc
    }

    async purge(pathname) {
        const loc = this.getCacheLocation(pathname)
        reporter.debug(`[CACHE] Purging '${loc}' (${pathname})`)
        return await rimraf(loc)
    }

    async stat(pathname = '/') {
        try {
            const location = this.getCacheLocation(pathname)
            const rootStats = await stat(location)
            if (rootStats.isDirectory()) {
                let files = await readdir(location)
                files = files
                    .filter(f => f[0] !== '.')
                    .sort((a, b) => a.toLowerCase() > b.toLowerCase())
                const stats = await Promise.all(
                    files.map(async f => stat(path.join(location, f)))
                )
                const mappedStats = stats.reduce(
                    (out, fileStats, i) => ({
                        ...out,
                        [files[i]]: fileStats,
                    }),
                    {}
                )
                return {
                    name: path.basename(location),
                    stats: rootStats,
                    children: mappedStats,
                }
            } else {
                return {
                    name: path.basename(location),
                    stats: rootStats,
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
}

module.exports = Cache
