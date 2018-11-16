const program = require('commander');

const reportError = (msg, ...args) => {
  if (process.env.NODE_ENV && process.env.NODE_ENV !== "production") {
    console.error(msg, ...args);
  }
}

const applyOption = (c, option, cmdName) => {
  if (Array.isArray(option)) {
    return c.option(...option);
  } else if (typeof option === 'string') {
    return c.option(option);
  } else {
    reportError(`Invalid option ${option} provided for command ${cmdName}`)
    return;
  }
}

const runSubCommand = ({ args, unknown }) => {
  program.executeSubCommand(process.argv, ['backend', ...args], unknown);
}

const reconstructOptionsHash = (command) => {
  const optionNames = command.options.reduce((names, option) => ({
    [option.name()]: true,
  }), {});

  const options = Object.keys(command).reduce((out, key) => {
    if (optionNames[key]) {
      out[key] = command[key];
    }
    return out;
  }, {});
  return options;
}

const parseCommand = (out, config) => {
  const { name, alias, options, description, run } = config;
  const c = program.command(name)
  if (description) {
    c.description(description);
  }
  if (alias) {
    c.alias(alias);
  }
  if (options && Array.isArray(options)) {
    options.forEach(option => applyOption(c, option, name));
  }
  if (!run) {
    c.allowUnknownOption();
  }
  c.action((...args) => {
    out.name = name;
    out.command = args.pop();
    out.options = reconstructOptionsHash(out.command);
    out.args = args;
    out.unknown = out.command._unknownOptions || [];
    out.isSubCommand = !run;
    out.run = run || runSubCommand;
    out.config = config;
  });
}

const parse = (commands, options) => {
  const out = {
    name: null,
    args: null,
    config: null,
  }

  commands.forEach((command, index) => {
    let commandConfig = command;
    if (typeof command === 'string') {
      commandConfig = {
        name: command,
      };
    }

    if (!commandConfig || !commandConfig.name) {
      reportError(`Invalid command provided to commandParser (index ${index})`, command);
      return;
    }

    parseCommand(out, commandConfig);
  })

  return out;
}

module.exports = {
  parse
};