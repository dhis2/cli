const { builder, handler } = require('./diff/index.js')

module.exports = {
    command: 'diff <leftUrl> <rightUrl>',
    desc: 'Generate a diff of schemas between DHIS2 versions',
    builder,
    handler,
}
