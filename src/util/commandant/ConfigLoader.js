const fs = require('fs');
const path = require('path');
const os = require('os');
const colors = require('colors');
const commander = require("commander");

const homedir = os.homedir();
const rcFileName = '.d2rc';
const configFileName = 'config.yaml';
const loader = {
  load,
  config: {},
  envPrefix: 'D2',
  loaded: false,
  configFiles: [],
}

const builtins = {
  verbose: false,
  quiet: false,
  rcfile: undefined,
  cache: path.join(homedir, '.cache'),
};

const log = (msg, force) => {
  if (loader.config.verbose || process.env.NODE_ENV === 'development') {
    process.stderr.write(`${"[CONFIG]".bold} ${msg}\n`.gray);
  }
}
const warn = (msg, force) => {
  log(msg.yellow)
}
const err = (msg) => {
  log(msg.red)
}

const makeEnvKey = key =>
  loader.envPrefix + "_" + key.replace(/\./g, "_").toUpperCase();

const getConfigProp = (key, keyPath, sources) => {
  for (let i = 0; i < sources.length; ++i) {
    const src = sources[i];
    let val;
    if (src.getter) {
      val = src.getter(key, keyPath);
    } else if (src.values) {
      val = src.values[key];
    }

    if (val !== undefined) {
      return { val, src };
    }
  }
  return {};
}
const setConfigProps = (configObj, prefix, sources, schema) => {
  Object.keys(schema).forEach(key => {
    if (!key) {
      return;
    }

    const keyPath = prefix && prefix.length ? `${prefix}.${key}` : key;
    if (keyPath === 'verbose' || keyPath == 'config') { return; } // verbosity and configuration file are special!

    if (typeof schema[key] === "object") {
      setConfigProps(
        configObj[key] = {},
        keyPath,
        sources.map(s => ({
          ...s,
          values: s.values && s.values[key] ? s.values[key] : undefined
        })),
        schema[key]
      );
      return;
    }

    const { val, src } = getConfigProp(key, keyPath, sources);
    if (src) {
      configObj[key] = val;
      process.env[makeEnvKey(keyPath)] = val;
      log(`${keyPath}=${val} (${src.name})`);
    }
  });
};

const loadConfigFileSources = (defaults, argConfigFile) => {
  const envConfigFile = process.env[makeEnvKey('config')];

  const cacheConfig = defaults.cache ? path.join(defaults.cache, configFileName) : null;

  const files = [
    argConfigFile,
    envConfigFile,
    path.join(process.cwd(), rcFileName),
    path.join(homedir, rcFileName),
    cacheConfig,
  ];

  const fileSources = [];
  files.forEach((file, i) => {
    if (file && fs.existsSync(file)) {
      loader.configFiles.push(file);
      try {
        const values = JSON.parse(fs.readFileSync(file, 'utf8')) || {};
        if (typeof values === 'object') {
          fileSources.push({ name: `FILE${i}`, filePath: file, values });
        } else {
          warn(`Config file ${file.bold} must contain a single JSON object`);
        }
      } catch (e) {
        err(`Failed to load JSON config file ${file.bold} (${e})`);
      }
    }
  })

  return fileSources;
}

const setVerbosity = (sources) => {
  const { val, src } = getConfigProp('verbose', 'verbose', sources);
  loader.config.verbose = !!val;
  if (val && src) {
    const envKey = makeEnvKey("verbose");
    process.env[envKey] = String(!!val);
    log(`verbose=true (${src.name})`);
  }
}

let argSource = {};
function load(defaults) {
  if (loader.loaded) {
    return;
  }

  defaults = {
    ...builtins,
    ...defaults,
  };

  const verbositySources = [
    { name: 'CLI', getter: (key, keyPath) => argSource[keyPath] },
    { name: 'ENV', getter: (key, keyPath) => process.env[makeEnvKey(keyPath)] },
  ]
  setVerbosity(verbositySources);

  if (!commander._name.length) {
    warn(`CLI configuration options will not be parsed.`);
    warn(`Call ${"configLoader.load".bold} after ${"commander.parse".bold} to support command-line configuration.`);
    verbositySources.shift();
  }

  const sources = [
    ...verbositySources,
    ...loadConfigFileSources(defaults, argSource.rcfile),
    { name: 'DEFAULT', values: defaults },
  ];
  log(`Config sources:`)
  sources.forEach(s => log(`\t${s.name}${s.filePath ? ` @ ${s.filePath}` : ""}`));

  setConfigProps(loader.config, '', sources, defaults);
  loader.loaded = true;

  return loader.config;
}

const splitConfigArg = assignment => {
  const idx = assignment.indexOf('=');
  if (idx === -1) {
    return [assignment.trim(), true]
  } else {
    return [assignment.substr(0, idx).trim(), assignment.substr(idx+1).trim()]
  }
}
const updateArgSource = (key, value) => {
  argSource[key] = value;
}

commander
  .option("--verbose", "Log all the things")
    .on('option:verbose', () => updateArgSource('verbose', 'true'))
  .option("--quiet", "Only print essential output")
    .on('option:quiet', () => updateArgSource('quiet', 'true'))
  .option("--rcfile <file>", "Specify a custom JSON config file")
    .on('option:rcfile', (file) => updateArgSource('rcfile', file))
  .option("--config <assignment>", "Explicitly set a config value (i.e. cache=./d2cache)")
    .on('option:config', (assignment) => updateArgSource(...splitConfigArg(assignment)));

module.exports = loader;