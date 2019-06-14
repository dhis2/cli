const path = require('path')
const jsondiffpatch = require('jsondiffpatch')
const fs = require('fs')
const utils = require('../../../support/utils')
const ejs = require('ejs')
const { reporter } = require('@dhis2/cli-helpers-engine')
const DHIS2HtmlFormatter = require('./schemaHtmlFormatter')

const {
    schemasFromUrl,
    writeOutput,
    schemaDiffIdentifier,
    defaultOpts,
    defaultRequestOpts,
} = require('../')

let cache
// We use the singular property as an unique identifier for schemas
// name and type are used for other nested properties
const objectHash = obj =>
    obj.singular || obj.name || obj.fieldName || obj.type || obj
const Differ = jsondiffpatch.create({
    objectHash,
    propertyFilter: name => name !== 'href' && name !== 'apiEndpoint',
    arrays: {
        detectMove: true,
        includeValueOnMove: true,
    },
})

const formatters = {
    html: DHIS2HtmlFormatter,
    console: jsondiffpatch.formatters.console,
}

async function getSchemas(urlLike, { baseUrl, auth, force }) {
    let schemas
    let fileContents

    if ((fileContents = utils.getJSONFile(urlLike))) {
        reporter.debug(urlLike, ' is a file')
        schemas = fileContents
    } else {
        if (!utils.isRelativeUrl(urlLike)) {
            baseUrl = undefined
            urlLike = utils.prependHttpProtocol(urlLike)
        }
        schemas = await schemasFromUrl(urlLike, {
            baseUrl,
            auth,
            force,
            cache,
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

function sortSchemaObject(a, b) {
    const aHash = objectHash(a)
    const bHash = objectHash(b)
    if (aHash < bHash) return -1
    if (aHash > bHash) return 1
    return 0
}

function sortArrayProps(obj) {
    Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (Array.isArray(val)) {
            const sorted = val.sort(sortSchemaObject)
            obj[key] = sorted
        } else if (typeof val === 'object') {
            sortArrayProps(val)
        }
    })
}

// We are not interersted in indexes, so we convert to an object
// with 'singular' as hash for schemas
// This makes the diff more stable, as it has problems with
// arrays with moved objects (even with objectHash)
function prepareDiff(left, right, { sortArrays }) {
    const setProp = (obj, curr) => {
        obj[curr.singular] = curr
        return obj
    }

    const leftO = left.reduce(setProp, {})
    const rightO = right.reduce(setProp, {})
    if (sortArrays) {
        sortArrayProps(leftO)
        sortArrayProps(rightO)
    }
    return [leftO, rightO]
}

function diff(schemasLeft, schemasRight, opts) {
    const [left, right] = prepareDiff(
        schemasLeft.schemas,
        schemasRight.schemas,
        opts
    )
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
        const defaultName = `${schemaDiffIdentifier(
            meta.left,
            meta.right
        )}.${extension}`
        writeOutput(loc, out, { defaultName })
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

async function run({
    url1,
    url2,
    baseUrl,
    format,
    output,
    ignoreArrayOrder,
    ...rest
}) {
    cache = rest.getCache()
    const schemasLeft = await getSchemas(url1, { baseUrl, ...rest })
    const schemasRight = await getSchemas(url2, { baseUrl, ...rest })
    //let [left, right] = await Promise.all([prom1, prom2])
    const { left, delta, meta } = diff(schemasLeft, schemasRight, {
        sortArrays: ignoreArrayOrder,
    })
    handleOutput(output, { format, left, delta, meta })
}

const builder = yargs => {
    yargs
        .positional('url1', {
            type: 'string',
            describe: `the url to the running DHIS2 server, should have schemas available relative to this at ${
                defaultOpts.schemasEndpoint
            }
            Can also be a JSON-file with schemas. See schema fetch`,
        })
        .positional('url2', {
            type: 'string',
            describe: `the url to another running DHIS2 server, should have schemas available relative to this at ${
                defaultOpts.schemasEndpoint
            }
            Can also be a JSON-file with schemas. See schema fetch`,
        })
        .option('base-url', {
            alias: 'b',
            default: defaultRequestOpts.baseUrl,
            coerce: opt => utils.prependHttpProtocol(opt),
            describe: `BaseUrl to use for downloading schemas. If this is set url1 and url2 should be relative to this url, eg. /dev. [default: ${
                defaultRequestOpts.baseUrl
            }]`,
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
        .option('ignore-array-order', {
            type: 'boolean',
            default: false,
            describe:
                'Sort all nested arrays in schemas. The order of nested arrays are non-deterministic, which may clutter the diff. Enabling this will prevent most internal array moves, which are probably irrelevant anyway. ',
        })
}
module.exports = { builder, handler: run }
