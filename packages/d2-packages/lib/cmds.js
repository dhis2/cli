module.exports = yargs => {
    yargs
        .commandDir('cmds')
        .command(
            'code-style [options]',
            'Use code-style to format code.',
            require('@dhis2/code-style/lib/cmds/fmt-code.js')
        )
        .command(
            'commit-style [options]',
            'Use commit-style to format commits.',
            require('@dhis2/code-style/lib/cmds/fmt-commit.js')
        )
}
