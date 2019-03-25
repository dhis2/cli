const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('scripts', {
    desc: '(no app scripts exist)',
    builder: yargs => {},
})

module.exports = command
