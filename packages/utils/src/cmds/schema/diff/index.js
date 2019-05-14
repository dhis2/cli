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
// name and type are used for other nested properties, fallback to index
const Differ = jsondiffpatch.create({
    objectHash: obj =>
        obj.singular || obj.name || obj.type || '$$index:' + index,
    propertyFilter: name => name !== 'href' && name !== 'apiEndpoint',
    arrays: {
        detectMove: true,
        includeValueOnMove: true,
    },
})

const formatters = {
    html: jsondiffpatch.formatters.html,
    console: jsondiffpatch.formatters.console,
}

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

async function getAuthHeader(url, { auth }) {
    let username, password
    if (auth) {
        ;[username, password] = auth.split(':')
    }
    if (auth === '') {
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

async function schemasFromUrl(url, { baseUrl, auth, force }) {
    const schemasUrl = url.concat(defaultOpts.schemasEndpoint)
    const infoUrl = url.concat(defaultOpts.infoEndpoint)
    const requestOpts = { ...defaultRequestOpts, baseUrl }
    requestOpts.headers.Authorization = await getAuthHeader(url, {
        auth,
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

async function getSchemas(urlLike, { baseUrl, auth, force }) {
    let schemas
    let fileContents

    if ((fileContents = getJSONFile(urlLike))) {
        reporter.debug(urlLike, ' is a file')
        schemas = fileContents
    } else {
        schemas = await schemasFromUrl(urlLike, {
            baseUrl,
            auth,
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

function diff(schemasLeft, schemasRight) {
    const [left, right] = prepareDiff(schemasLeft.schemas, schemasRight.schemas)
    const delta = Differ.diff(left, right)
    const meta = {
        left: schemasLeft.meta,
        right: schemasRight.meta,
    }

    return {
        delta,
        meta,
        left,
        right,
    }
}

function handleOutput(loc = false, { left, delta, meta, format }) {
    let out = delta
    let extension = format
    switch (format) {
        case 'html': {
            out = generateHtml({ left, delta, meta })
            break
        }
        case 'console': {
            out = formatters.console.format(delta, left)
            extension = 'out'
            break
        }
        case 'json': {
            out = JSON.stringify(delta)
            break
        }
    }

    if (loc !== false) {
        writeOutput(loc, out, { meta, extension })
    } else {
        reporter.pipe(out)
    }
}

function generateHtml({ left, delta, meta }) {
    const assets = {
        jsondiffpatchCSS: utils.btoa(
            fs.readFileSync(
                require.resolve('jsondiffpatch/dist/formatters-styles/html.css')
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
        formatted: formatters.html.format(delta),
        ...assets,
    })
}

function writeOutput(loc, output, { meta, extension }) {
    let isDir = false
    try {
        isDir = fs.statSync(loc).isDirectory()
    } catch (e) {
        isDir = false
    }
    if (loc === '' || loc === true || isDir) {
        const fileName = `${schemaDiffIdentifier(
            meta.left,
            meta.right
        )}.${extension}`
        loc = path.join(isDir ? loc : '', fileName)
    }

    fs.writeFileSync(loc, output)
    reporter.info('Visual output generated:', loc)
    reporter.pipe(loc)
}

async function run({ url1, url2, baseUrl, format, output, ...rest }) {
    cache = rest.getCache()
    const schemasLeft = await getSchemas(url1, { baseUrl, ...rest })
    const schemasRight = await getSchemas(url2, { baseUrl, ...rest })
    //let [left, right] = await Promise.all([prom1, prom2])
    const { left, delta, meta } = diff(schemasLeft, schemasRight)
    handleOutput(output, { format, left, delta, meta })
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
        .option('output', {
            alias: 'o',
            type: 'string',
            describe: `Specify the location of the output. If used as a flag a file relative to current working directory is generated with the name "LEFT-version_revision__RIGHT-version_revision.html".
            If the location is a directory, the default filename is used and output to location.`,
        })
        .option('format', {
            type: 'string',
            default: 'console',
            choices: ['html', 'json', 'console'],
            describe: `Specify the format of the output`,
        })
        .option('force', {
            type: 'boolean',
            describe:
                'By default each schema is cached, identified by the version and revision. Use this flag to disable caching and download the schemas.',
        })
        .option('auth', {
            type: 'string',
            describe: `Auth to use, formatted as "user:password". Note that this is not safe, as password is shown in history.
            Use it as a flag (--auth, no args) to be prompted for credentials for each server.`,
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
