const { strings } = require('./');

module.exports = (name, { commands, builder, ...opts }) => {
  if (!name || !String(name).length) {
    throw new Error('Namespaces must have a name!');
  }
  return Object.assign({
    command: name,
    usage: `${name} <command>`,
    builder: y => {
      if (builder) {
        builder(y);
      } else if (commands && Array.isArray(commands) && commands.length) {
        commands.forEach(c => y.command(c));
      } else if (commands && typeof commands === 'object' && Object.keys(commands).length) {
        Object.keys(commands).forEach(command => {
          y.command(Object.assign({ command }, commands[command]));
        })
      } else {
        throw new Error('Namespaces must have at least one command or provide a builder function');
      }

      y.demandCommand(1, strings.missingCommand);
      y.recommendCommands();
    }
  }, opts);
}
