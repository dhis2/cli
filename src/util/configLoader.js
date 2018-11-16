const configDefaults = require('./configDefaults');
const fs = require('fs');
const path = require('path');
const os = require('os');
const colors = require('colors');

const homedir = 'homedir';
const rcFileName = '.d2rc';
const configFileName = 'config.yaml';
const loader = {
  load,
  config: {},
  envPrefix: 'D2',
  loaded: false,
  configFiles: [],
}

require('commander')
  .option('--verbose', 'Log all the things')
  .option('--config <file>', 'Specify a custom config file');

const log = (msg, ...args) => {
  if (loader.config.verbose) {
    console.log(`${"[CONFIG]".bold} ${msg} ${args.join(', ')}`.gray);
  }
}
const warn = (msg) => {
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

const loadConfigFileSources = (argConfigFile) => {
  const envConfigFile = process.env[makeEnvKey('config')];

  const cacheDir = configDefaults.cache;

  const files = [
    argConfigFile,
    envConfigFile,
    path.join(process.cwd(), rcFileName),
    path.join(homedir, rcFileName),
    path.join(cacheDir, configFileName),
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

function load(args) {
  if (loader.loaded) {
    return;
  }

  const verbositySources = [
    { name: 'CLI', getter: (key, keyPath) => args[keyPath] },
    { name: 'ENV', getter: (key, keyPath) => process.env[makeEnvKey(keyPath)] },
  ]
  setVerbosity(verbositySources);

  const sources = [
    ...verbositySources,
    ...loadConfigFileSources(args.config),
    { name: 'DEFAULT', values: configDefaults },
  ];
  log(`Config sources:`)
  sources.forEach(s => log(`\t${s.name}${s.filePath ? ` @ ${s.filePath}` : ""}`));

  setConfigProps(loader.config, '', sources, configDefaults);
  loader.loaded = true;

  return loader.config;
}

module.exports = loader;