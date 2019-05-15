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
        'Fetch schema from running DHIS2 server. Can be used to generate diff offline.',
    builder: {},
    handler,
}

module.exports = command
