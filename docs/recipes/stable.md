---
title: Spin up a stable version
sidebar_label: Use a stable version
id: stable
slug: '/cli/recipes/stable'
---

# Spin up a stable version

Spinning up a stable version is what you generally want. The Stable version is the one tested and released by the DHIS2 core team. It is the version that is recommended for production use, and therefore also the best to develop on. However, sometimes it makes sense to check out the development branch to test with the latest features. Read more about the [development branch here](./development.md).

First up, in the best case scenario where you want to run DHIS2 v40 on an empty database, you are able to run:

```bash
d2 cluster up 2.40

# result
# ---
# channel: stable
# dhis2Version: 2.40.0
# dbVersion: empty
```

Usually you want to `seed` your database with a database dump from Sierra Leone to have an instance set up with data. If you add the `--seed` command to the command above, it will try to find the database dump `2.40.0` on the [databases](https://databases.dhis2.org/) site. If it doesn't exist it will throw an error.

```bash
d2 cluster up 2.40.0 --seed
# fail: if there's no 2.40.0 database dump, it will fail
```

You'll need to provide a `--db-version` argument to tell the command which database dump to use. The database dump needs to exist on the [databases](https://databases.dhis2.org/) site.

```bash
d2 cluster up 2.40.0 --db-version 2.40 --seed

# result
# ---
# channel: stable
# dhis2Version: 2.40.0
# dbVersion: 2.40
```
