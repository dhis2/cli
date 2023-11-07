---
# This file is only used on the bundled docsify site
---

# Install the CLI

```bash
yarn global add @dhis2/cli
```

or through npm

```
npm install --global @dhis2/cli
```

## Verify that it is available on PATH

```
d2 --version
```

## Ad-hoc usage

You can also run the CLI ad-hoc with `npx`, no installation necessary (sacrifices startup performance). So only do this if you've got a good use case for it. In most cases you'll want to install it globally.

```
> npx @dhis2/cli <args>
```
