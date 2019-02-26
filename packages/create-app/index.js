const { groupGlobalOptions } = require('@dhis2/cli-helpers-engine')
const create = require('@dhis2/cli-create')

module.exports = {
    command: 'create [type]',
    desc: 'Create a new DHIS2 front-end app',
    builder: yargs => {
        groupGlobalOptions(yargs)
        yargs.option('silent')
    },
    handler: argv => {
        create.handler({
            ...argv,
            type: 'app',
        })
    },
}
