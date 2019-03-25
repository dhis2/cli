# cli-cluster

> This package is part of the [@dhis2/cli](https://github.com/dhis2/cli)
> commandline interface.

## Installation

While you can install and run `d2-cluster` from `@dhis2/cli-cluster`, the preferred entrypoint is the root `d2` CLI. To install the `d2` CLI:

```sh
> yarn global add @dhis2/cli
> d2 cluster --help
#OR
> npm install --global @dhis2/cli
> d2 cluster --help
#OR
> npx @dhis2/cli-cluster --help # Download and run commands in-line, no installation necessary
```

Depending on your installation method, the following examples which use `d2 cluster` may need to be modified to use `d2-cluster`, or `npx @dhis2/cli-cluster`.

## Spin up a development cluster

This sequence of commands will install the latest bleeding-edge DHIS2 core instance in a Docker container and seed it with the relevant Sierra Leone [demo database](https://github.com/dhis2/dhis2-demo-db/)

```sh
> d2 cluster up dev --seed
> d2 cluster logs dev core
# Wait for the line "Catalina.start Server startup in XXXX ms", then ctrl+c / cmd+c to terminate
> d2 cluster restart 2.31.1 gateway # this is a hack necessary to rehup the gateway
# DHIS2 is available with Sierra Leone db at http://localhost:8080
# Run the Analytics Table export task from the Data Administration app
```

Note that any Docker image in [amcgee/dhis2-core](https://cloud.docker.com/u/amcgee/repository/docker/amcgee/dhis2-core) can be used, just omit the `-alpine` suffix. Sierra Leone demo databases are automatically downloaded from the [dhis2-demo-db](https://github.com/dhis2/dhis2-demo-db) repository.

## Known Issues

-   The 2.31 patch releases (2.31.0, 2.31.1, etc.) are nested, so they cannot be downloaded automatically. You can download any .sql.gz file manually and specify it with the `--seedFile` option to the `d2 cluster up` command or the `--path` option to the `d2 cluster seed` command.

-   The `d2 cluster seed <version>` command sometimes exits prematurely after downloading the db archive, run it again _without_ the `--update` option to continue seeding the cluster database from the downloaded file.
