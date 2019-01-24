/** @format */

// ANSI control codes

module.exports = {
    bold: str => '\u001b[1m' + str + '\u001b[0m',
    reverse: str => '\u001b[7m' + str + '\u001b[0m',
}
