# D2 CLI

A unified CLI for DHIS2 development workflows.

[![dhis2-cli Compatible](https://img.shields.io/badge/dhis2-cli-ff69b4.svg)](https://github.com/dhis2/cli)
[![build](https://img.shields.io/travis/dhis2/cli.svg)](https://travis-ci.com/dhis2/cli)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

## Installation and Usage

See the [documentation site](https://cli.dhis2.nu) for end-user installation and usage instructions

## Conventions

The `d2` command-line tool is structured as a collection of namespaces, each of which may include sub-namespaces and sub-commands. This hierarchy should follow one simple rule:

**namespaces are nouns, commands are verbs**

Each subsequent namespace should narrow the context in which a command (an action) will be performed. For example:

-   `d2 cluster restart` performs the action `restart` in the `d2 cluster` namespace
-   `d2 style js apply` performs the **apply** action in the **js** sub-namespace of the **d2 style** namespace

Anything following the action verb is either a positional argument or a flag (if preceded by `-` or `--`), i.e.:

-   `d2 style js apply --all --no-stage` tells the `apply` action to run on all files and not to stage the changes in git
-   `d2 cluster restart dev gateway` passes the arguments `dev` and `gateway` to the `restart` action, which tells the action which service to restart.

## CLI Modules

| Alias             | Executable        | Package                     | Source                                                                      | Version                                                                                                                           |
| ----------------- | ----------------- | --------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| d2                | d2                | @dhis2/cli                  | [./packages/main](packages/main)                                            | [![npm](https://img.shields.io/npm/v/@dhis2/cli.svg)](https://www.npmjs.com/package/@dhis2/cli)                                   |
| d2 app            | d2-app            | @dhis2/cli-app              | [./packages/app](./packages/app)                                            | [![npm](https://img.shields.io/npm/v/@dhis2/cli-app.svg)](https://www.npmjs.com/package/@dhis2/cli-app)                           |
| d2 app scripts    | d2-app-scripts    | @dhis2/cli-app-scripts      | [dhis2/app-platform](https://github.com/dhis2/app-platform/tree/master/cli) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-app-scripts.svg)](https://www.npmjs.com/package/@dhis2/cli-app-scripts)           |
| d2 cluster        | d2-cluster        | @dhis2/cli-cluster          | [./packages/cluster](./packages/cluster)                                    | [![npm](https://img.shields.io/npm/v/@dhis2/cli-cluster.svg)](https://www.npmjs.com/package/@dhis2/cli-cluster)                   |
| d2 create         | d2-create         | @dhis2/cli-create           | [./packages/create](./packages/create)                                      | [![npm](https://img.shields.io/npm/v/@dhis2/cli-create.svg)](https://www.npmjs.com/package/@dhis2/cli-create)                     |
| d2 create app     | d2-create-app     | @dhis2/create-app           | [./packages/create-app](./packages/create-app)                              | [![npm](https://img.shields.io/npm/v/@dhis2/create-app.svg)](https://www.npmjs.com/package/@dhis2/create-app)                     |
| d2 style          | d2-style          | @dhis2/cli-style            | [dhis2/cli-style](https://github.com/dhis2/cli-style)                       | [![npm](https://img.shields.io/npm/v/@dhis2/cli-style.svg)](https://www.npmjs.com/package/@dhis2/cli-style)                       |
| d2 utils          | d2-utils          | @dhis2/cli-utils            | [./packages/utils](./packages/utils)                                        | [![npm](https://img.shields.io/npm/v/@dhis2/cli-utils.svg)](https://www.npmjs.com/package/@dhis2/cli-utils)                       |
| d2 utils docsite  | d2-utils-docsite  | @dhis2/cli-utils-docsite    | [dhis2/cli-utils-docsite](https://github.com/dhis2/cli-utils-docsite)       | [![npm](https://img.shields.io/npm/v/@dhis2/cli-utils-docsite.svg)](https://www.npmjs.com/package/@dhis2/cli-utils-docsite)       |
| d2 utils cypress  | d2-utils-cypress  | @dhis2/cli-utils-cypress    | [dhis2/cli-utils-cypress](https://github.com/dhis2/cli-utils-cypress)       | [![npm](https://img.shields.io/npm/v/@dhis2/cli-utils-docsite.svg)](https://www.npmjs.com/package/@dhis2/cli-utils-cypress)       |
| d2 utils codemods | d2-utils-codemods | @dhis2/cli-utils-codemods   | [dhis2/cli-utils-codemods](https://github.com/dhis2/cli-utils-codemods)     | [![npm](https://img.shields.io/npm/v/@dhis2/cli-utils-docsite.svg)](https://www.npmjs.com/package/@dhis2/cli-utils-codemods)      |
|                   |                   | @dhis2/cli-helpers-engine   | [dhis2/cli-helpers-engine](https://github.com/dhis2/cli-helpers-engine)     | [![npm](https://img.shields.io/npm/v/@dhis2/cli-helpers-engine.svg)](https://www.npmjs.com/package/@dhis2/cli-helpers-engine)     |
|                   |                   | @dhis2/cli-helpers-template | [dhis2/cli-helpers-template](https://github.com/dhis2/cli-helpers-template) | [![npm](https://img.shields.io/npm/v/@dhis2/cli-helpers-template.svg)](https://www.npmjs.com/package/@dhis2/cli-helpers-template) |

## Report an issue

The issue tracker can be found in [DHIS2 JIRA](https://jira.dhis2.org)
under the [CLI](https://jira.dhis2.org/projects/CLI) project.

Deep links:

-   [Bug](https://jira.dhis2.org/secure/CreateIssueDetails!init.jspa?pid=10703&issuetype=10006&components=11021)
-   [Feature](https://jira.dhis2.org/secure/CreateIssueDetails!init.jspa?pid=10703&issuetype=10300&components=11021)
-   [Task](https://jira.dhis2.org/secure/CreateIssueDetails!init.jspa?pid=10703&issuetype=10003&components=11021)
