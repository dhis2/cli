# D2 CLI

A unified CLI for DHIS2 development workflows.

![npm](https://img.shields.io/npm/v/@dhis2/cli.svg)

## Installation

The CLI can be installed globally with `npm` or `yarn` as follows:

```sh
> yarn glogal add @dhis2/cli
OR
> npm install --global @dhis2/cli
```

You can also run the CLI ad-hoc with `npx`, no installation necessary (sacrifices startup performance):

```
> npx @dhis2/cli app create
```

## Usage

```sh
> d2 --help
d2 <command>

Commands:
  d2 app      Manage DHIS2 applications                             [aliases: a]
  d2 debug    Debug local d2 installation
  d2 cluster  Manage DHIS2 Docker clusters                          [aliases: c]

Options:
  --version   Show version number                                      [boolean]
  --config    Path to JSON config file
  -h, --help  Show help                                                [boolean]
```

## Examples

Bootstrap a new DHIS2 application

```sh
> d2 app create
```

Spin up a DHIS2 server installation on port 8082 (requires [Docker](https://www.docker.com/products/docker-desktop))

```sh
> d2 cluster up 2.31-rc1-alpine --port 8082
```

## Features & v1.0 Roadmap

- [x] Heirarchical command namespaces (`d2`, `d2 app`, `d2 app scripts` etc.)
- [x] Programmatic and command-line entrypoints at any command level
- Configurability through:
  - [x] command-line (`--verbose=true`)
  - [x] custom file (`--config=.myd2rc`)
  - [x] package.json (`"d2": { "verbose": true }`)
  - [x] environment variables (`D2_VERBOSE=true`)
  - [ ] find-up .rc files
  - [ ] globally-installed user config (`~/.config/d2` or `~/.cache/d2`)
- [ ] Namespaced configuration (i.e. { config: { verbose: true } } instead of { verbose: true }
- [x] A user-level file cache (located at `~/.cache/d2`) and abstract caching mechanism for use in various commands.
- [x] Meta/debug command namespace for:
  - Cache inspection `d2 debug cache`, i.e. `d2 debug cache list`
  - Config printing `d2 debug config`
  - System diagnostics `d2 debug system`
- [x] Automatic update checks with [update-notifier](https://npmjs.com/package/update-notifier) (updates checked at most 1x per day)
- [x] Basic DHIS2 Docker cluster management with `d2 cluster`
- [ ] Incorporate [packages](https://github.com/dhis2/packages) as a command module
- [ ] Implement unit tests, integration tests, and `code-style`
- [ ] Enforce Commit-Style and Travis CI for automated (non-manual) NPM publishing
- [ ] Build standalone packaged executables with [pkg](https://www.npmjs.com/package/pkg)
- [ ] Cut version 1.0 with baseline feature set and semantic versioning guarantee

### Bonus features

- [ ] Consider mono-repo or poly-repo for code sharing (particularly sharing `cliUtils`)
- [ ] Consider using typescript for better static analysis
