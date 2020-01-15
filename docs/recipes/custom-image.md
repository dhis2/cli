# Spin up a custom DHIS2 Docker image

## Build the custom image

For detailed instructions on how to build a complete DHIS2 image [refer
to the instructions in the core repository](https://github.com/dhis2/dhis2-core/blob/master/docker/README.md).

```bash
cd /path/to/dhis2-core
docker build -t base:superfly .
./docker/extract-artifacts.sh base:superfly
ONLY_DEFAULT=1 ./docker/build-containers.sh core:superfly local
```

## Use image with d2-cluster

This will spin up DHIS2 and seed the database with the **dev** dump of
the database.

```bash
d2 cluster up superfly \
    --image core:superfly \
    --db-version dev \
    --seed
```
