# D2 CLI

A unified CLI for DHIS2 development workflows.

[![dhis2-cli Compatible](https://img.shields.io/badge/dhis2-cli-ff69b4.svg)](https://github.com/dhis2/cli)
[![build](https://img.shields.io/travis/dhis2/cli.svg)](https://travis-ci.org/dhis2/cli)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Greenkeeper badge](https://badges.greenkeeper.io/dhis2/cli.svg)](https://greenkeeper.io/)

| Alias | Executable | Package | Source | Version |
| ----- | ---------- | ------- | ------ | ------- |
| d2    | d2 | @dhis2/cli | [./packages/d2](packages/d2) | [![npm](https://img.shields.io/npm/v/@dhis2/cli.svg)](https://www.npmjs.com/package/@dhis2/cli)  |
| d2 app | d2-app | @dhis2/cli-app | [./packages/d2-app](./packages/d2-app) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-app.svg)](https://www.npmjs.com/package/@dhis2/cli-app)  |
| d2 app create | create-d2-app | @dhis2/create-app | [./packages/create-app](./packages/create-app) | [![npm](https://img.shields.io/npm/v/@dhis2/create-app.svg)](https://www.npmjs.com/package/@dhis2/create-app)  |
| d2 cluster | d2-cluster | @dhis2/cli-cluster | [./packages/d2-cluster](./packages/d2-cluster) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-cluster.svg)](https://www.npmjs.com/package/@dhis2/cli-cluster)  |
| d2 utils | d2-utils | @dhis2/cli-utils | [./packages/d2-utils](./packages/d2-utils) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-utils.svg)](https://www.npmjs.com/package/@dhis2/cli-utils)  |
| d2 style | d2-style | @dhis2/cli-style | [dhis2/cli-style](https://github.com/dhis2/cli-style) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-style.svg)](https://www.npmjs.com/package/@dhis2/cli-style)  |
| d2 packages | d2-packages | @dhis2/cli-packages | [dhis2/cli-packages](https://github.com/dhis2/cli-packages) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-packages.svg)](https://www.npmjs.com/package/@dhis2/cli-packages)  |
|  |  | @dhis2/cli-helpers-engine | [./packages/helpers-engine](./packages/helpers-engine) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-helpers-engine.svg)](https://www.npmjs.com/package/@dhis2/cli-helpers-engine) |

## Installation

The CLI can be installed globally with `npm` or `yarn` as follows:

```sh
> yarn global add @dhis2/cli
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
  d2 debug     Debug local d2 installation
  d2 app       Manage DHIS2 applications                            [aliases: a]
  d2 cluster   Manage DHIS2 Docker clusters                         [aliases: c]
  d2 packages  Manage DHIS2 packages                              [aliases: pkg]
  d2 style     DHIS2 programmatic style for commit msgs/code        [aliases: s]
  d2 utils     Utils for miscellaneous operations

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

## Conventions

The `d2` command-line tool is structured as a collection of namespaces, each of which may include sub-namespaces and sub-commands.  This heirarchy should follow one simple rule: 

**namespaces are nouns, commands are verbs**

Each subsequent namespace should narrow the context in which a command (an action) will be performed.  For example:

* `d2 app create` performs the action **create** in the **d2 app** namespace
* `d2 style js apply` performs the **apply** action in the **js** sub-namespace of the **d2 style** namespace

Anything following the action verb is either a positional argument or a flag (if preceded by `-` or `--`), i.e.:

* `d2 style js apply --all --no-stage` tells the `apply` action to run on all files and not to stage the changes in git
* `d2 app create my-app` passes the argument `my-app` to the `create` action, which tells the action what to name the created application.

## Features & v1.0 Roadmap

-   [x] Heirarchical command namespaces (`d2`, `d2 app`, `d2 app scripts` etc.)
-   [x] Programmatic and command-line entrypoints at any command level
-   Configurability through:
    -   [x] command-line (`--verbose=true`)
    -   [x] custom file (`--config=.myd2rc`)
    -   [x] package.json (`"d2": { "verbose": true }`)
    -   [x] environment variables (`D2_VERBOSE=true`)
    -   [ ] find-up .rc files
    -   [ ] globally-installed user config (`~/.config/d2` or `~/.cache/d2`)
-   [ ] more performant config/cache initialization (they currently cause a slight startup lag)
-   [ ] Namespaced configuration (i.e. { config: { verbose: true } } instead of { verbose: true }
-   [x] A user-level file cache (located at `~/.cache/d2`) and abstract caching mechanism for use in various commands.
-   [x] Meta/debug command namespace for:
    -   Cache inspection `d2 debug cache`, i.e. `d2 debug cache list`
    -   Config printing `d2 debug config`
    -   System diagnostics `d2 debug system`
-   [x] Automatic update checks with [update-notifier](https://npmjs.com/package/update-notifier) (updates checked at most 1x per day)
-   [x] Basic DHIS2 Docker cluster management with `d2 cluster`
-   [x] Incorporate [packages](https://github.com/dhis2/packages) as a command module
    -   [x] Link to updated [packages](https://github.com/dhis2/packages) using cli engine
    -   [ ] Deprecate `d2 package` ?
-   [x] Implement `d2-app-scripts` for application creation (WIP [app-platform](https://github.com/amcgee/dhis2-app-platform)
-   [ ] Implement top-level `create` command for bootstrapping `cli`, `app`, and other components
-   [x] Integrate the legacy [`dhis2-cli`](https://www.npmjs.com/package/dhis2-cli) UUID generation functionality ([source](https://github.com/dhis2/dhis2-cli))
-   Implement
    -   [ ] unit tests
    -   [ ] integration / smoke tests
    -   [x] `code-style`
        -    [x] Switch to verb-form command
    -   [x] `commit-style`
        -    [x] Switch to verb-form command
    -   [x] Travis CI
        -   [ ] CI deploy to NPM
-   [ ] Build standalone packaged executables with [pkg](https://www.npmjs.com/package/pkg)
-   [ ] Add individual package READMEs for better NPM optics
-   [ ] Consolidate `makeEntryPoint` and `notifyOfUpdates` since it's boilderplate code.
-   [ ] Handle rejected promises at command level (incorporate `exitOnCatch` helper)
-   [x] Confirm Greenkeeper functionality (add greenkeeper.json for monorepo awareness)
-   [ ] Confirm that update notifications work well
-   [ ] Cut version 1.0 with baseline feature set and semantic versioning guarantee

### Bonus features

-   [x] Consider mono-repo or poly-repo for code sharing (particularly sharing `cliUtils`)
-   [ ] Consider using typescript for better static analysis
