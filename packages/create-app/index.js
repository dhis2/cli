const { groupGlobalOptions } = require('@dhis2/cli-helpers-engine')

module.exports = {
    command: 'create [type]',
    desc: 'Create a new DHIS2 front-end app',
    builder: yargs => {
        groupGlobalOptions(yargs)
        yargs.option('silent')
    },
    handler: argv => {
        console.log('CREATE APP HERE')
    },
}
