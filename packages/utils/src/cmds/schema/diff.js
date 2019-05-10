const { builder, handler } = require('./diff/index.js')

module.exports = {
    command: 'diff <url1> <url2>',
    desc: 'Generate a diff of schemas between DHIS2 versions',
    builder,
    handler: argv => handler(argv),
}
