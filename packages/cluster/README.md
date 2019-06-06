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

## Common concepts

### Release channels

DHIS2 has several release channels, such as **dev** and **stable**.

To each channel several artifacts can be published, so the **stable**
channel contains all the stable releases of DHIS2, such as 2.32.0,
2.32.1, etc.

The **dev** channel is the latest build straight from the development
branches. There is one development branch per supported release of
DHIS2.

For our Docker images, that means that we have one repo on Docker Hub
per channel:

- Stable: https://cloud.docker.com/u/dhis2/repository/docker/dhis2/core
- Dev: https://cloud.docker.com/u/dhis2/repository/docker/dhis2/core-dev

### Tags

Within each Docker repo, we have multiple tags. The channel coupled with
the tag uniquely identifies a built DHIS2 Docker image. This is
important for how the `cluster` command works.

For the **stable channel** each tag represents a formally released version
of DHIS2.

- [2.32.0](https://github.com/dhis2/dhis2-core/tree/2.32.0)
- [2.31.3](https://github.com/dhis2/dhis2-core/tree/2.31.3)

For the **dev channel**, each tag represents the last build from the
development branches in
[dhis2/dhis2-core](https://github.com/dhis2/dhis2-core):

- [master](https://github.com/dhis2/dhis2-core/tree/master)
- [2.32](https://github.com/dhis2/dhis2-core/tree/2.32)
- [2.31](https://github.com/dhis2/dhis2-core/tree/2.31)
- [2.30](https://github.com/dhis2/dhis2-core/tree/2.30)

### Database dumps

For development DHIS2 provides a [set of database
dumps](https://github.com/dhis2/dhis2-demo-db) which are essential in
getting a usable environment up and running quickly.

Most often we use the [Sierra
Leone](https://github.com/dhis2/dhis2-demo-db/tree/master/sierra-leone)
dumps.

## Usage

### Getting help

Remember that the help is your friend:

```bash
d2 cluster --help
```

### Command layout

There are two arguments that are always required for the `cluster` to
command to be able to do anything at all: `{command}` and `{name}`.

```bash
d2 cluster {command} {name}
```

The command refers to an action, like `up` or `down` and the name is the
name of the cluster to operate on, which can be anything you like, like
`mydev`, `superfly`, or `2.32`.

### Arguments

In addition to the command and name, there are more arguments you can
pass to `cluster` to customize your environment. If the arguments are
omitted there is some fallback logic, so even if they are not used, they
are important to know about.

- `--channel`: This matches to the Docker Hub repository mentioned above
  in [Release channels](#release-channels). E.g. `dev`.

- `--dhis2-version`: This matches to the [tag name within a Docker
  Hub repo](#tags). E.g.
  [`2.32`](https://cloud.docker.com/u/dhis2/repository/docker/dhis2/core-dev/tags)

- `--db-version`: This matches to the database dumps mentioned in
  [Database dumps](#database-dumps). E.g. `dev` or `2.32`.

So through a combination of these arguments: `channel`, `dhis2-version`,
and `db-version` we can spin up a cluster.

### Spin up a stable version

First up, in the best case scenario where you want to run DHIS2 2.32.0 on
an empty database, you are able to run:

```bash
d2 cluster up 2.32.0

# result
# ---
# channel: stable
# dhis2Version: 2.32.0
# dbVersion: empty
```

Usually you want to `seed` your database with a database dump from
Sierra Leone to have an instance set up with data. If you add the
`--seed` command to the command above, it will try to find the database
dump 2.32.0 in the
[dhis2-db-demo](https://github.com/dhis2/dhis2-demo-db/tree/master/sierra-leone)
repo. That doesn't exist, but 2.32 does.

```bash
d2 cluster up 2.32.0 --seed
# fail: there's no db dump with 2.32.0

d2 cluster up 2.32.0 --db-version 2.32 --seed

# result
# ---
# channel: stable
# dhis2Version: 2.32.0
# dbVersion: 2.32
```

### Spin up a development version

Let's switch to the **dev** channel as we want the bleeding edge build
from 2.32. We want it seeded with a 2.32 dump so we are going to run it
with `--seed`.

```bash
d2 cluster up 2.32 --channel dev --seed

# result
# ---
# channel: dev
# dhis2Version: 2.32
# dbVersion: 2.32
```

Since the 2.32 branch exists in
[dhis2-core](https://github.com/dhis2/dhis2-core/tree/2.32) and the 2.32
dump exists in
[dhis2-demo-db](https://github.com/dhis2/dhis2-demo-db/tree/master/sierra-leone/2.32)
the tool doesn't need more information to create an environment.

Now, let's run a `master` build from the **dev** channel:

```bash
d2 cluster up master --channel dev --db-version dev --seed

# result
# ---
# channel: dev
# dhis2Version: master
# dbVersion: dev
```

Since the `--dhis2-version` argument was omitted, it used the `{name}`
as fallback. Since we used `master` as the name, and the `master` tag
exists in the
[dhis2/core-dev](https://cloud.docker.com/u/dhis2/repository/docker/dhis2/core-dev/tags)
it is able to resolve a complete environment.

We could also have run:

```bash
d2 cluster up master --channel dev --db-version dev --dhis2-version master --seed
```

The name can be anything you wish, but remember to specify `channel`,
`dhis2-version`, and `db-version` in that case.

## Configuration

### Cached configuration

To avoid having to pass in all arguments over and over when using the
`up` and `down` commands often, the `cluster` command caches your
configuration per cluster in a `config.json` file.

```bash
d2 debug cache list cluster/2.32.0
┌────────────────┬──────┬─────────────────────┐
│ Name           │ Size │ Modified            │
├────────────────┼──────┼─────────────────────┤
│ config.json    │ 171  │ 2019-06-06 11:07:37 │
├────────────────┼──────┼─────────────────────┤
│ docker-compose │ 512  │ 2019-06-06 11:07:32 │
└────────────────┴──────┴─────────────────────┘
```

And it looks like this:

```bash
cat ~/.cache/d2/cache/cluster/2.32.0/config.json
{
    "channel": "dev",
    "dbVersion": "2.32",
    "dhis2Version": "2.32.0",
    "customContext": false,
    "image": "dhis2/core{channel}:{version}",
    "port": 8080
}
```

This means that if you run a command sequence like:

```bash
d2 cluster up superfly --db-version 2.31 --dhis2-version master --seed --custom-context --port 9999 --channel dev

d2 cluster down superfly

d2 cluster up superfly
```

The second time you run `up superfly` it will use the configuration from
the first run:

```bash
cat ~/.cache/d2/cache/cluster/superfly/config.json
{
    "channel": "dev",
    "dbVersion": "2.31",
    "dhis2Version": "master",
    "customContext": true,
    "image": "dhis2/core{channel}:{version}",
    "port": "9999"
}
```

To purge the `config.json` file you can use:

```bash
d2 debug cache purge cluster/superfly/config.json
? Are you sure you want to remove cache item "cluster/superfly/config.json"? Yes
Purged cache item cluster/superfly/config.json
```

### Persistent configuration

It is also possible to set up your clusters in the `d2` configuration
file, e.g. `~/.config/d2/config.js`:

```js
module.exports = {
    cluster: {
        channel: 'stable',
        clusters: {
            superfly: {
                channel: 'dev',
                dbVersion: '2.31',
                dhis2Version: 'master',
                customContext: true,
                image: 'dhis2/core{channel}:{version}',
                port: 9999
            }
        }
    }
}
```

```bash
d2 cluster up superfly

# saves the configuration to `config.json`
cat ~/.cache/d2/cache/cluster/superfly/config.json
{
    "channel": "dev",
    "dbVersion": "2.31",
    "dhis2Version": "master",
    "customContext": true,
    "image": "dhis2/core{channel}:{version}",
    "port": 9999
}
```

From here it's possible to override the configuration file properties
for a cluster as well:

```
# port is 9999 in ~/.config/d2/config.js:clusters.superfly.port
d2 cluster up superfly --port 8888

# port is saved as 8888 in ~/.cache/d2/cache/cluster/superfly/config.json:port
```

Now for each subsequence `down` and `up` command, the cached config will
take priority over the persistent configuration. When you clear the
cache, the persistent configuration will come into effect again.
