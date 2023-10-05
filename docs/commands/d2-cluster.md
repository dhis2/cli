---
title: d2 cluster overview
sidebar_label: Overview
id: d2-cluster
slug: '/cli/cluster'
---

# d2 cluster overview

`d2 cluster` helps you spin up a DHIS2 instance using ([Docker](https://www.docker.com)) containers.

# Usage

To use the `d2 cluster` command, you need to have the `@dhis2/cli` package installed globally.

Then you can use the `d2 cluster` command with the `--help` flag to get more information about the available commands and options.

```sh
d2 cluster --help
```

Which will output something like this:

```sh
Commands:
  d2 cluster compose <name>            Run arbitrary docker-compose commands
                                       against a DHIS2 cluster.
                                       NOTE: pass -- after <name>   [aliases: c]
  d2 cluster db                        Manage the database in a DHIS2 Docker
                                       cluster
  d2 cluster down <name>               Destroy a running container  [aliases: d]
  d2 cluster list                      List all active cluster configurations
                                                                   [aliases: ls]
  d2 cluster logs <name> [service]     Tail the logs from a given service
                                                                    [aliases: l]
  d2 cluster restart <name> [service]  Restart a cluster or cluster service
                                                                    [aliases: r]
  d2 cluster status <name>             Check the status of cluster containers
                                                                    [aliases: s]
  d2 cluster up <name>                 Spin up a new cluster        [aliases: u]

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

```

# Common concepts

Depending on your installation method, the following examples which use `d2 cluster` may need to be modified to use `d2-cluster`, or `npx @dhis2/cli-cluster`.

For consistency we will use `d2 cluster`.

## Release channels

DHIS2 has several release channels, such as **dev** and **stable**.

To each channel several artifacts can be published, so the **stable** channel contains all the stable releases of DHIS2, such as 2.39.0, 2.40.0.1, etc.

The **dev** channel is the latest build straight from the development branches. There is one development branch per supported release of DHIS2.

> Keep in mind with the development branch it's a work in progress, so it might not be stable or cause unexpected issues. Never use these for production environments.

For our Docker images, that means that we have one repo on Docker Hub per channel:

-   Stable: https://hub.docker.com/r/dhis2/core
-   Dev: https://hub.docker.com/r/dhis2/core-dev

## Tags

Within each Docker repo, we have multiple tags. The channel coupled with the tag uniquely identifies a built DHIS2 Docker image. This is important for how the `cluster` command works.

For the **stable channel** each tag represents a formally released version of DHIS2. For example:

-   [2.39.2.1](https://github.com/dhis2/dhis2-core/tree/2.39.2.1)
-   [2.40.0](https://github.com/dhis2/dhis2-core/tree/2.40.0)

For the **dev channel**, each tag represents the last build from the development branches in
[dhis2/dhis2-core](https://github.com/dhis2/dhis2-core):

-   [master](https://github.com/dhis2/dhis2-core/tree/master)
-   [2.38](https://github.com/dhis2/dhis2-core/tree/2.38)
-   [2.39](https://github.com/dhis2/dhis2-core/tree/2.39)
-   [2.40](https://github.com/dhis2/dhis2-core/tree/2.40)

For more tags you can look at the tags page at the GitHub repository: https://github.com/dhis2/dhis2-core/tags

## Database dumps

For development DHIS2 provides a [set of database dumps](https://databases.dhis2.org/) which are essential in getting a usable environment up and running quickly.

There are database dumps per version of DHIS2, but also for the dev channel. Look at the filenames to see which version they are for.

# d2 cluster command layout

There are two arguments that are always required for the `cluster` to command to be able to do anything at all: `{command}` and `{name}`.

```bash
d2 cluster {command} {name}
```

The command refers to an action, like `up` or `down` (see below for more information and examples) and the name is the name of the cluster to operate on, which can be anything you like, like `mydev`, `superfly`, or `2.40`.

## Command `up`

This command spins up a new cluster:

```bash
d2 cluster up {name}
```

To spin up a cluster for version `2.40` for example, you can use the following command:

```bash
d2 cluster up 2.40 --db-version 2.40
```

This assumes a db-version of 2.40 exists, and a docker container with 2.40 exists. Make sure to check the [database dumps](#database-dumps) and [release channels](#release-channels) sections for more information.

To read more in-depth about spinning up a stable release, check the [stable](../recipes/stable.md) page.

## Command `down`

This command destroys a running container:

```bash
d2 cluster down {name}
```

To destroy a cluster for version `2.40`, which we created above, for example, you can use the following command:

```bash
d2 cluster down 2.40
```

### Command `down --clean`

This command brings down a cluster and cleans up after itself. This destroys all containers and volumes associated with the cluster. For example, this means that the attached database will be wiped so it is useful when you want to remove a cluster entirely. Replace the `{name}` with the name of the cluster you want to remove, such as 2.40 above.

```bash
d2 cluster down {name} --clean
```

# Arguments

In addition to the command and name, there are more arguments you can pass to `cluster` to customize your environment. If the arguments are omitted there is some fallback logic, so even if they are not used, they are important to know about.

-   `--channel`: This matches to the Docker Hub repository mentioned above
    in [Release channels](#release-channels). E.g. `dev`.

-   `--dhis2-version`: This matches to the [tag name within a Docker
    Hub repo](#tags). E.g.
    [`2.40`](https://hub.docker.com/r/dhis2/core-dev/tags)

-   `--db-version`: This matches to the database dumps mentioned in
    [Database dumps](#database-dumps). E.g. `dev` or `2.40`.

So through a combination of these arguments: `channel`, `dhis2-version`, and `db-version` we can spin up a cluster.

# Configuration

## Cached configuration

To avoid having to pass in all arguments over and over when using the `up` and `down` commands often, the `cluster` command caches your configuration per cluster in a `config.json` file.

```bash
d2 debug cache list clusters/2.40.1
┌────────────────┬──────┬─────────────────────┐
│ Name           │ Size │ Modified            │
├────────────────┼──────┼─────────────────────┤
│ config.json    │ 205  │ 2023-10-05 06:59:04 │
├────────────────┼──────┼─────────────────────┤
│ docker-compose │ 160  │ 2023-08-09 12:52:24 │
└────────────────┴──────┴─────────────────────┘ 
```

And it looks like this:

```bash
cat ~/.cache/d2/cache/clusters/2.40.1/config.json
{
    "channel": "stable",
    "dbVersion": "2.40",
    "dhis2Version": "2.40.1",
    "dhis2Home": "/opt/dhis2",
    "customContext": false,
    "image": "dhis2/core{channel}:{version}",
    "port": 8080
}
```

This means that if you run a command sequence like:

```bash
d2 cluster up superfly \
    --db-version 2.40 \
    --dhis2-version master \
    --seed \
    --custom-context \
    --port 9999 \
    --channel dev

d2 cluster down superfly

d2 cluster up superfly
```

The second time you run `up superfly` it will use the configuration from the first run:

```bash
cat ~/.cache/d2/cache/clusters/superfly/config.json
{
    "channel": "dev",
    "dbVersion": "2.40",
    "dhis2Version": "master",
    "customContext": true,
    "image": "dhis2/core{channel}:{version}",
    "port": "9999"
}
```

This config file is automatically purged when you run `down --clean`.

To manually purge the `config.json` file you can use:

```bash
d2 debug cache purge clusters/superfly/config.json
? Are you sure you want to remove cache item "clusters/superfly/config.json"? Yes
Purged cache item clusters/superfly/config.json
```

## Persistent configuration

It is also possible to set up your clusters in the `d2` configuration file, e.g. `~/.config/d2/config.js`:

```js
module.exports = {
    cluster: {
        channel: 'stable',
        clusters: {
            superfly: {
                channel: 'dev',
                dbVersion: '2.40',
                dhis2Version: 'master',
                customContext: true,
                image: 'dhis2/core{channel}:{version}',
                port: 9999,
            },
        },
    },
}
```

```bash
d2 cluster up superfly

# saves the configuration to `config.json`
cat ~/.cache/d2/cache/clusters/superfly/config.json
{
    "channel": "dev",
    "dbVersion": "2.31",
    "dhis2Version": "master",
    "customContext": true,
    "image": "dhis2/core{channel}:{version}",
    "port": 9999
}
```

From here it's possible to override the configuration file properties for a cluster as well:

```
# port is 9999 in ~/.config/d2/config.js:clusters.superfly.port
d2 cluster up superfly --port 8888

# port is saved as 8888 in ~/.cache/d2/cache/clusters/superfly/config.json:port
```

Now for each subsequence `down` and `up` command, the cached config will take priority over the persistent configuration. When you clear the cache, the persistent configuration will come into effect again.
