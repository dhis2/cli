const { schemasFromUrl, writeOutput, schemaIdentifier } = require('./index.js')
const { reporter } = require('@dhis2/cli-helpers-engine')

const handler = async ({ url, output = false, force, auth, ...rest }) => {
    const cache = rest.getCache()
    const schemasWithMeta = await schemasFromUrl(url, { auth, force, cache })
    const defaultName = `${schemaIdentifier(schemasWithMeta.meta)}.json`
    const out = JSON.stringify(schemasWithMeta)

    if (output !== false) {
        writeOutput(output, out, { defaultName })
    } else {
        reporter.pipe(out)
    }
}

const command = {
    command: 'fetch <url>',
    describe:
        'Fetch schema from a running DHIS2 server. Can be used to feed into "schema diff".',
    builder: {
        output: {
            alias: 'o',
            type: 'string',
            describe: `Specify the location of the output. If used as a flag a file relative to current working directory is generated with the name "version_revision.json".
            If the location is a directory, the default filename is used and output to location.`,
        },
    },
    handler,
}

module.exports = command
