const { namespace } = require('@dhis2/cli-utils')
const codeCommand = require('@dhis2/code-style/lib/cmds/fmt-code.js')
const commitCommand = require('@dhis2/code-style/lib/cmds/fmt-commit.js')

module.exports = namespace('style', {
    desc: 'Enforce DHIS2 code- and commit-style conventions',
    aliases: 's',
    commands: [
        {
            command: 'js [options]',
            desc: 'Use code-style to format javascript code.',
            builder: codeCommand.builder,
            handler: codeCommand.handler,
        },
        {
            command: 'commit [options]',
            desc: 'Use commit-style to format javascript commits.',
            builder: commitCommand.builder,
            handler: commitCommand.handler,
        },
    ],
})
