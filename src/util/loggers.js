const withLabel = (msg, label, color = x=>x) => color(`${`[${label}]`.bold} ${(msg)}`);
module.exports = {

  dump: (msg) => process.stdout.write(`${msg}`.gray),
  print: (msg, args) => console.log(msg, ...args),
  config: (msg, args) => console.log(`${"[CONFIG]".bold} ${msg} ${args.join(', ')}`.gray),
  debug: (msg) => process.stdout.write(withLabel(msg, 'DEBUG', colors.gray) + '\n'),
  info: (msg) => process.stdout.write(`${msg}\n`.cyan),
  warn: (msg) => process.stderr.write(withLabel(msg, 'WARNING', colors.yellow) + '\n'),
  err: (msg) => process.stderr.write(withLabel(msg, 'ERROR\n`.red),
}
