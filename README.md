# D2 CLI

A unified CLI for DHIS2 development workflows.

[![dhis2-cli Compatible](https://img.shields.io/badge/dhis2-cli-ff69b4.svg)](https://github.com/dhis2/cli)
[![build](https://img.shields.io/travis/dhis2/cli.svg)](https://travis-ci.com/dhis2/cli)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Greenkeeper badge](https://badges.greenkeeper.io/dhis2/cli.svg)](https://greenkeeper.io/)

| Alias         | Executable    | Package                   | Source                                                                  | Version                                                                                                                       |
| ------------- | ------------- | ------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| d2            | d2            | @dhis2/cli                | [./packages/d2](packages/d2)                                            | [![npm](https://img.shields.io/npm/v/@dhis2/cli.svg)](https://www.npmjs.com/package/@dhis2/cli)                               |
| d2 app        | d2-app        | @dhis2/cli-app            | [./packages/d2-app](./packages/d2-app)                                  | [![npm](https://img.shields.io/npm/v/@dhis2/cli-app.svg)](https://www.npmjs.com/package/@dhis2/cli-app)                       |
| d2 create app | d2-create-app | @dhis2/create-app         | [./packages/create-app](./packages/create-app)                          | [![npm](https://img.shields.io/npm/v/@dhis2/create-app.svg)](https://www.npmjs.com/package/@dhis2/create-app)                 |
| d2 create     | d2-create     | @dhis2/cli-create         | [./packages/d2-create](./packages/d2-create)                            | [![npm](https://img.shields.io/npm/v/@dhis2/cli-create.svg)](https://www.npmjs.com/package/@dhis2/cli-create)                 |
| d2 cluster    | d2-cluster    | @dhis2/cli-cluster        | [./packages/d2-cluster](./packages/d2-cluster)                          | [![npm](https://img.shields.io/npm/v/@dhis2/cli-cluster.svg)](https://www.npmjs.com/package/@dhis2/cli-cluster)               |
| d2 utils      | d2-utils      | @dhis2/cli-utils          | [./packages/d2-utils](./packages/d2-utils)                              | [![npm](https://img.shields.io/npm/v/@dhis2/cli-utils.svg)](https://www.npmjs.com/package/@dhis2/cli-utils)                   |
| d2 style      | d2-style      | @dhis2/cli-style          | [dhis2/cli-style](https://github.com/dhis2/cli-style)                   | [![npm](https://img.shields.io/npm/v/@dhis2/cli-style.svg)](https://www.npmjs.com/package/@dhis2/cli-style)                   |
|               |               | @dhis2/cli-helpers-engine | [dhis2/cli-helpers-engine](https://github.com/dhis2/cli-helpers-engine) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-helpers-engine.svg)](https://www.npmjs.com/package/@dhis2/cli-helpers-engine) |

## Installation and Usage

See the [main entrypoint package](./packages/main) for end-user installation and usage instructions

## Conventions

The `d2` command-line tool is structured as a collection of namespaces, each of which may include sub-namespaces and sub-commands. This heirarchy should follow one simple rule:

**namespaces are nouns, commands are verbs**

Each subsequent namespace should narrow the context in which a command (an action) will be performed. For example:

-   `d2 cluster restart` performs the action **restart** in the **d2 cluster** namespace
-   `d2 style js apply` performs the **apply** action in the **js** sub-namespace of the **d2 style** namespace

Anything following the action verb is either a positional argument or a flag (if preceded by `-` or `--`), i.e.:

-   `d2 style js apply --all --no-stage` tells the `apply` action to run on all files and not to stage the changes in git
-   `d2 cluster restart dev gateway` passes the arguments `dev` and `gateway` to the `restart` action, which tells the action which service to restart.
