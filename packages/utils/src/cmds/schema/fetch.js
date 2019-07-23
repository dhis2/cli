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
    ;({ auth, baseUrl } = resolveConfig(rest))

    for (const url of urls) {
        let bUrl = baseUrl
        if (!isRelativeUrl(url)) {
            bUrl = undefined
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
            coerce: urls => {
                return urls.map(url => prependHttpsProtocol(url))
            },
        },
        output: {
            alias: 'o',
            type: 'string',
            describe: `Specify the location of the output. If used as a flag a file relative to current working directory is generated with the name "version_revision.json".
            If the location is a directory, the default filename is used and output to location.`,
        },
        'base-url': {
            alias: 'b',
            coerce: opt => utils.prependHttpsProtocol(opt),
            describe: `BaseUrl to use for downloading schemas. If this is set, all urls should be relative to this eg. /dev.`,
            type: 'string',
        },
    },
    handler,
}

module.exports = command
