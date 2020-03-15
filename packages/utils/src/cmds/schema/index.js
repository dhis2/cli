const fs = require('fs')
const path = require('path')
const utils = require('../../support/utils')
const request = require('request')
const inquirer = require('inquirer')
const { reporter } = require('@dhis2/cli-helpers-engine')

const defaultOpts = {
    schemasEndpoint: '/api/schemas.json',
    infoEndpoint: '/api/system/info.json',
}

const defaultRequestOpts = {
    headers: {
        'x-requested-with': 'XMLHttpRequest',
    },
    json: true,
}

const prompt = inquirer.createPromptModule({ output: process.stderr })

const schemaIdentifier = info => `${info.version}_${info.revision}`
const schemaDiffIdentifier = (info1, info2) =>
    `${schemaIdentifier(info1)}__${schemaIdentifier(info2)}`

function asyncRequest(url, opts) {
    return new Promise(resolve => {
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

function resolveConfig(args) {
    if (!args.utils || !args.utils.schema) {
        return args
    }
    const config = args.utils.schema
    return {
        ...args,
        ...config,
        auth: args.auth || authFromConf(config),
        authLeft: args.auth || authFromConf(config, config.leftServer),
        authRight: args.auth || authFromConf(config, config.rightServer),
    }
}

function authFromConf(conf = {}, serverConfig = {}) {
    const auth = {
        username: serverConfig.username || conf.username,
        password: serverConfig.password || conf.password,
    }
    if (auth.username && auth.password) return auth
    return true
}

async function getAuthHeader(url, { auth }) {
    let username, password
    if (!auth || auth === true) {
        ;({ username, password } = await prompt([
            {
                type: 'input',
                name: 'username',
                message: `Username for ${url}`,
            },
            {
                type: 'password',
                name: 'password',
                message: `Password for ${url}`,
                mask: true,
            },
        ]))
    } else {
        ;({ username, password } = auth)
    }
    return username && password
        ? utils.basicAuthHeader(username, password)
        : undefined
}

async function schemasFromUrl(url, { baseUrl, auth, force, cache }) {
    const schemasUrl = url.concat(defaultOpts.schemasEndpoint)
    const infoUrl = url.concat(defaultOpts.infoEndpoint)
    const requestOpts = { ...defaultRequestOpts, baseUrl }
    requestOpts.headers.Authorization = await getAuthHeader(url, {
        auth,
    })
    const meta = await asyncRequest(infoUrl, requestOpts)
    const rev = utils.isSHA(meta.revision)
    if (!rev) {
        meta.revision = 'REV-NA'
        reporter.warn('No revision found')
    }
    const schemaFileName = `${schemaIdentifier(meta)}.json`
    const loc = await cache.get(schemasUrl, schemaFileName, {
        requestOpts,
        force,
    })
    const schemas = utils.getJSONFile(loc).schemas
    return {
        meta,
        schemas,
    }
}

function writeOutput(loc, output, { defaultName }) {
    let isDir = false
    try {
        isDir = fs.statSync(loc).isDirectory()
    } catch (e) {
        isDir = false //sanity
    }
    if (loc === '' || loc === true || isDir) {
        loc = path.join(isDir ? loc : '', defaultName)
    }

    fs.writeFileSync(loc, output)
    reporter.info('Output written to: ', loc)
    reporter.pipe(loc)
}

module.exports = {
    asyncRequest,
    schemasFromUrl,
    writeOutput,
    schemaIdentifier,
    schemaDiffIdentifier,
    prompt,
    defaultOpts,
    defaultRequestOpts,
    authFromConf,
    resolveConfig,
}
