const URL = require('url').URL
const fs = require('fs')

function isUrl(url) {
    try {
        new URL(url)
        return true
    } catch (e) {
        return false
    }
}

function btoa(str) {
    return Buffer.from(str).toString('base64')
}

function basicAuthHeader(user, pass) {
    const b64 = btoa(`${user}:${pass}`)
    return `Basic ${b64}`
}

function isAbsoluteUrl(url) {
    return url.indexOf('http://') === 0 || url.indexOf('https://') === 0
}

function isRelativeUrl(url) {
    return url.indexOf('/') === 0
}

function prependHttpProtocol(url) {
    if (!url.startsWith('http')) {
        return `https://${url}`
    }
    return url
}

function getJSONFile(file) {
    try {
        const content = fs.readFileSync(file)
        return JSON.parse(content)
    } catch (e) {
        if (e instanceof SyntaxError) {
            //file exists, not json
            return false
        }
        return null
    }
}

function isSHA(str) {
    return /^[0-9a-f]{7,40}$/i.test(str)
}

module.exports = {
    isUrl,
    isAbsoluteUrl,
    isRelativeUrl,
    prependHttpProtocol,
    btoa,
    basicAuthHeader,
    getJSONFile,
    isSHA,
}
