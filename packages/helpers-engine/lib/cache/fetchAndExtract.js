const fs = require('fs')
const request = require('request')
const tar = require('tar')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const reporter = require('../reporter') // TODO: generalize

const { rename } = require('./fsAsync')

module.exports = async ({ url, name, tmpLoc, outLoc, raw }) => {
    const p = new Promise(async (resolve, reject) => {
        const stream = request
            .get(url)
            .on('error', e => {
                reporter.dumpErr(e)
                reporter.error(`[CACHE] Failed to fetch ${name} from ${url}`)
                reject()
            })
            .on('warn', reporter.warn)

        if (
            !raw &&
            (url.substr(-7) === '.tar.gz' || url.substr(-4) === '.tar')
        ) {
            reporter.debug(
                `[CACHE] Fetching and extracting ${chalk.bold(name)}`
            )
            reporter.debug(`[CACHE]   from ${chalk.bold(url)}`)
            reporter.debug(`[CACHE]   to ${chalk.bold(outLoc)}`)
            reporter.debug(`[CACHE]   tmpLoc ${chalk.bold(tmpLoc)}`)
            await mkdirp(tmpLoc)
            stream
                .pipe(
                    tar.extract({
                        strip: 1,
                        cwd: tmpLoc,
                    })
                )
                .on('end', async () => {
                    try {
                        await rename(tmpLoc, outLoc)
                        resolve(outLoc)
                    } catch (e) {
                        reject(
                            `Failed to rename ${chalk.bold(
                                tmpLoc
                            )} to ${chalk.bold(outLoc)}`
                        )
                    }
                })
        } else {
            reporter.debug(`[CACHE] Fetching ${chalk.bold(name)}`)
            reporter.debug(`[CACHE]   from ${chalk.bold(url)}`)
            reporter.debug(`[CACHE]   to ${chalk.bold(outLoc)}`)
            stream
                .pipe(fs.createWriteStream(outLoc))
                .on('end', () => resolve(outLoc))
        }
    })

    return p
}
