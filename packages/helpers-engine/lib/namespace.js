const strings = require('./helpers/strings')

module.exports = (name, { commands, desc, builder, ...opts }) => {
    if (!name || !String(name).length) {
        throw new Error('Namespaces must have a name!')
    }
    return Object.assign(
        {
            command: name,
            desc,
            builder: y => {
                if (builder) {
                    builder(y)
                } else if (
                    commands &&
                    Array.isArray(commands) &&
                    commands.length
                ) {
                    commands.forEach(c => y.command(c))
                } else if (
                    commands &&
                    typeof commands === 'object' &&
                    Object.keys(commands).length
                ) {
                    Object.keys(commands).forEach(command => {
                        y.command(Object.assign({ command }, commands[command]))
                    })
                } else {
                    throw new Error(
                        'Namespaces must have at least one command or provide a builder function'
                    )
                }

                y.demandCommand(1, strings.missingCommand)
                y.recommendCommands()
                y.check(argv => {
                    if (y.getCommandInstance().getCommands().length === 0) {
                        // Only for namespaces, not commands themselves
                        return true
                    }
                    const command = argv._[y.getContext().commands.length]
                    if (
                        !command ||
                        y
                            .getCommandInstance()
                            .getCommands()
                            .indexOf(command) === -1
                    ) {
                        throw new Error(strings.unrecognizedCommand)
                    }
                    return true
                })
            },
        },
        opts
    )
}
