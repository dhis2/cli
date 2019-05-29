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
            coerce: val => val || (val === '' && defaultRequestOpts.baseUrl),
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
}
module.exports = { builder, handler: run }
