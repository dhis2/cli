/** @format */

let loglevel = 2

if (process.env.DEBUG) {
    loglevel = 3
}

module.exports = loglevel
