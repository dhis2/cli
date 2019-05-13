const path = require('path')
const jsondiffpatch = require('jsondiffpatch')
const fs = require('fs')
const utils = require('./utils')
const ejs = require('ejs')
const request = require('request')
const { reporter } = require('@dhis2/cli-helpers-engine')
const inquirer = require('inquirer')
const defaultOpts = {
    schemasEndpoint: '/api/schemas.json',
    infoEndpoint: '/api/system/info.json',
    cacheLocation: 'cache',
}

const defaultRequestOpts = {
    baseUrl: 'https://play.dhis2.org',
    headers: {
        'x-requested-with': 'XMLHttpRequest',
        Authorization: utils.basicAuthHeader('admin', 'district'),
    },
    json: true,
}

let cache
const prompt = inquirer.createPromptModule({ output: process.stderr })

const schemaIdentifier = info => `${info.version}_${info.revision}`
const schemaDiffIdentifier = (info1, info2) =>
    `${schemaIdentifier(info1)}__${schemaIdentifier(info2)}`

// We use the singular property as an unique identifier for schemas
// name and type are used for other nested properties
const Differ = jsondiffpatch.create({
    objectHash: obj =>
        obj.singular || obj.name || obj.type || '$$index:' + index,
    propertyFilter: name => name !== 'href' && name !== 'apiEndpoint',
    arrays: {
        detectMove: true,
        includeValueOnMove: true,
    },
})

function asyncRequest(url, opts) {
    return new Promise((resolve, reject) => {
        request.get(url, opts, (err, res, body) => {
            if (err || res.statusCode > 299) {
                reporter.error('Request', url, 'failed to fetch')
                err && reporter.dumpErr(err)
                res &&
                    reporter.error(
                        res.statusCode,
                        ':',
                        res.statusMessage || (res.body && res.body.message)
                    )
                process.exit(1)
            }
            return resolve(body)
        })
    })
}

function getJSONFile(file) {
    try {
        const content = fs.readFileSync(file)
        return JSON.parse(content)
    } catch (e) {
        return false
    }
}

async function getAuthHeader(url, { auth, promptAuth }) {
    let username, password
    if (auth) {
        ;[username, password] = auth.split(':')
    }
    if (promptAuth) {
        ;({ username, password } = await prompt([
            {
                type: 'input',
                name: 'username',
                message: `Username for ${url}`,
                default: 'admin',
            },
            {
                type: 'password',
                name: 'password',
                message: `Password for ${url}`,
                default: 'district',
                mask: true,
            },
        ]))
    }
    return username && password
        ? utils.basicAuthHeader(username, password)
        : defaultRequestOpts.headers.Authorization
}

async function schemasFromUrl(url, { baseUrl, auth, promptAuth, force }) {
    const schemasUrl = url.concat(defaultOpts.schemasEndpoint)
    const infoUrl = url.concat(defaultOpts.infoEndpoint)
    const requestOpts = { ...defaultRequestOpts, baseUrl }
    requestOpts.headers.Authorization = await getAuthHeader(url, {
        auth,
        promptAuth,
    })

    const meta = await asyncRequest(infoUrl, requestOpts)
    const schemaFileName = `${schemaIdentifier(meta)}.json`
    const loc = await cache.get(schemasUrl, schemaFileName, {
        raw: true,
        requestOpts,
        force,
    })
    const schemas = getJSONFile(loc).schemas
    return {
        meta,
        schemas,
    }
}

async function getSchemas(urlLike, { baseUrl, auth, promptAuth, force }) {
    let schemas
    let fileContents

    if ((fileContents = getJSONFile(urlLike))) {
        reporter.debug(urlLike, ' is a file')
        schemas = fileContents
    } else {
        schemas = await schemasFromUrl(urlLike, {
            baseUrl,
            auth,
            promptAuth,
            force,
        })
    }

    if (!schemas.schemas || !schemas.meta) {
        reporter.error(
            `${urlLike} is malformed. Must have an object with keys: [schemas, meta]`
        )
        process.exit(1)
    }
    return schemas
}

// We are not interersted in indexes, so we convert to an object
// with 'singular' as hash for schemas
// This makes the diff more stable, as it has problems with
// arrays with moved objects (even with objectHash)
function prepareDiff(left, right) {
    const leftO = left.reduce((acc, curr) => {
        acc[curr.singular] = curr
        return acc
    }, {})
    const rightO = right.reduce((acc, curr) => {
        acc[curr.singular] = curr
        return acc
    }, {})
    return [leftO, rightO]
}

function diff(schemasLeft, schemasRight, { html = false, json }) {
    const [left, right] = prepareDiff(schemasLeft.schemas, schemasRight.schemas)
    const delta = Differ.diff(left, right)
    const meta = {
        left: schemasLeft.meta,
        right: schemasRight.meta,
    }
    if (json) {
        reporter.pipe(JSON.stringify(delta))
    } else if (html !== false) {
        writeHtml(html, { left, right, delta, meta })
    }

    return delta
}

function generateHtml({ left, right, delta, meta }) {
    const assets = {
        jsondiffpatchCSS: utils.btoa(
            fs.readFileSync(
                require.resolve('jsondiffpatch/dist/formatters-styles/html.css')
            )
        ),
        jsondiffpatchJS: utils.btoa(
            fs.readFileSync(
                require.resolve('jsondiffpatch/dist/jsondiffpatch.umd.slim.js')
            )
        ),
    }

    const template = fs
        .readFileSync(path.join(__dirname, 'index.ejs'))
        .toString()

    return ejs.render(template, {
        left,
        delta,
        meta,
        right,
        ...assets,
    })
}

function writeHtml(loc, { left, right, delta, meta }) {
    reporter.debug('Generating visuals...')

    const html = generateHtml({ left, right, delta, meta })
    let isDir = false
    try {
        isDir = fs.statSync(loc).isDirectory
    } catch (e) {
        isDir = false
    }
    if (loc === '' || loc === true || isDir) {
        const fileName = `${schemaDiffIdentifier(meta.left, meta.right)}.html`
        loc = path.join(isDir ? loc : '', fileName)
    }

    fs.writeFileSync(loc, html)
    reporter.info('Visual output generated:', loc)
    reporter.pipe(loc)
}

async function run({ url1, url2, baseUrl, html, json, ...rest }) {
    cache = rest.getCache()
    const left = await getSchemas(url1, { baseUrl, ...rest })
    const right = await getSchemas(url2, { baseUrl, ...rest })
    //let [left, right] = await Promise.all([prom1, prom2])
    return diff(left, right, { html, json })
}

const builder = yargs => {
    yargs
        .positional('url1', {
            type: 'string',
            describe: `the url to the running DHIS2 server, should have schemas available relative to this at ${
                defaultOpts.schemasEndpoint
            }`,
        })
        .positional('url2', {
            type: 'string',
            describe: `the url to another running DHIS2 server, should have schemas available relative to this at ${
                defaultOpts.schemasEndpoint
            }`,
        })
        .option('base-url', {
            alias: 'b',
            coerce: val => val || (val === '' && defaultRequestOpts.baseUrl),
            describe:
                'BaseUrl to use for downloading schemas. If this is set url1 and url2 should be relative to this url, eg. /dev.',
            type: 'string',
        })
        .option('html', {
            type: 'string',
            default: true,
            describe: `Specify the location of the html output. By default a file relative to current working directory is generated with the name "LEFT-version_revision__RIGHT-version_revision.html".
                Use --no-html to not generate a report.
                If the location is a directory, the default filename is used and output to location.`,
        })

        .option('json', {
            alias: 'j',
            type: 'boolean',
            default: false,
            describe:
                'Output JSON instead of displaying a visualization. Can be used to pipe the diff to a file.',
        })
        .option('force', {
            type: 'boolean',
            describe:
                'By default each schema is cached, identified by the version and revision. Use this flag to disable caching and download the schemas.',
        })
        .option('auth', {
            type: 'string',
            describe: `Auth to use, formatted as "user:password". Note that this is not safe, as password is shown in history.
                        Use --prompt-auth to be prompted for sensitive passwords instead of through cli.
                        Note that this uses the same credentials for both servers. Use --prompt-auth for different credentials.`,
        })

        .option('prompt-auth', {
            type: 'boolean',
            conflicts: 'auth',
            describe:
                'A prompt for username and password for each server will be given.',
        })

        .check(argv => {
            const { url1, url2 } = argv
            if (
                !argv.baseUrl &&
                (!utils.isAbsoluteUrl(url1) || !utils.isAbsoluteUrl(url2))
            ) {
                throw new Error(
                    'Must specify absolute urls when base-url is not given.'
                )
            }
            return true
        }, false)
}
module.exports = { builder, handler: run }
