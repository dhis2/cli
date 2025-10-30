---
# This file is only used on the bundled docsify site
---

# Install the CLI

```bash
pnpm add -g @dhis2/cli
```

or through npm

```
npm install --global @dhis2/cli
```

## Verify that it is available on PATH

```
d2 --version
```

## Initialize a new web app

If you are only interested in scaffolding a new web app you can bypass installing the whole CLI, and make use of [npm create](https://docs.npmjs.com/cli/v11/commands/npm-init) convention:

```sh
# with pnpm
pnpm create @dhis2/app project-name --yes
#
```

This will create a new DHIS2 web application. Check the documentation for [@dhis2/create-app](./commands/create-app.md) for more information.

## Ad-hoc usage

You can also run the CLI ad-hoc with `npx`, no installation necessary (sacrifices startup performance). So only do this if you've got a good use case for it. In most cases you'll want to install it globally.

```
> npx @dhis2/cli <args>
```
