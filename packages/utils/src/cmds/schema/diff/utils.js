const URL = require('url').URL

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

module.exports = {
    isUrl,
    isAbsoluteUrl,
    btoa,
    basicAuthHeader,
}
