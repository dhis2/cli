# D2 CLI

A unified CLI for DHIS2 development workflows.

## Installation

The CLI can be installed globally with `npm` or `yarn` as follows:

```sh
> yarn glogal add @dhis2/cli
OR
> npm install --global @dhis2/cli
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
