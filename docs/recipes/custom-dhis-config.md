---
title: Use a custom dhis.conf
sidebar_label: Custom dhis.conf
id: custom-dhis-config
slug: '/cli/recipes/custom-dhis-config'
---

# Spin up environment with custom dhis.conf file

Given that you have a `dhis.conf` file on somewhere on your computer, you can override the [default `dhis.conf`](https://github.com/dhis2/docker-compose/blob/master/cluster/config/DHIS2_home/dhis.conf) supplied by the [Docker Compose setup](https://github.com/dhis2/docker-compose/blob/master/cluster/docker-compose.yml#L7).

To do so, use the `--dhis2-config` switch to `d2 cluster up`:

```
d2 cluster up 2.40.0 --dhis2-config /path/to/custom-dhis.conf
```
