const {
    schemasFromUrl,
    writeOutput,
    schemaIdentifier,
    resolveConfig,
} = require('./index.js')
const { reporter } = require('@dhis2/cli-helpers-engine')
const { prependHttpsProtocol, isRelativeUrl } = require('../../support/utils')
const path = require('path')

const handler = async ({ urls, output = false, force, ...rest }) => {
    const cache = rest.getCache()
    const { auth, baseUrl } = resolveConfig(rest)

    for (let url of urls) {
        let bUrl = baseUrl
        if (!isRelativeUrl(url)) {
            bUrl = undefined
            url = prependHttpsProtocol(url)
        }
        // this should probably be Promise.all(), but that causes problems with
        // credentials-prompt
        const schemasWithMeta = await schemasFromUrl(url, {
            auth,
            force,
            cache,
            baseUrl: bUrl,
        })

        const defaultName = `${schemaIdentifier(schemasWithMeta.meta)}.json`
        const out = JSON.stringify(schemasWithMeta)

        if (output !== false) {
            output = urls.length > 1 ? path.dirname(output) : output
            writeOutput(output, out, { defaultName })
        } else {
            reporter.pipe(out)
        }
    }
}

const command = {
    command: 'fetch <urls...>',
    describe:
        'Fetch schema from a running DHIS2 server. Can be used to feed into "schema diff".',
    builder: {
        urls: {
            type: 'array',
        },
        output: {
            alias: 'o',
            type: 'string',
            describe: `Specify the location of the output. If used as a flag a file relative to current working directory is generated with the name "version_revision.json".
            If the location is a directory, the default filename is used and output to location.`,
        },
        'base-url': {
            alias: 'b',
            coerce: opt => prependHttpsProtocol(opt),
            describe: `BaseUrl to use for downloading schemas. If this is set, urls that are relative (starts with /) will be appended to this url. eg. /dev.`,
            type: 'string',
        },
    },
    handler,
}

module.exports = command
