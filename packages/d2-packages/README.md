# 📦 packages

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Standardised tool for dealing with DHIS2 Packages.

# Features

-   focus on "flatpak" packages (publish from inside build directory)
-   copies `package.json` from `${pkg}` to `${pkg}/build/`
-   updates `build/package.json` with `private: false` and `publicAccess` props
-   bundles formatters for code-style and commit-style from [@dhis2/code-style](https://github.com/dhis2/code-style)
-   plugin architecture based on [yargs command modules](https://github.com/yargs/yargs/blob/master/docs/advanced.md#providing-a-command-module)

## Monorepo aware

-   monorepo support (packages in `${repo}/packages/`)
-   figures out interdependencies between packages
-   create symlinks between interdependent packages from inside `build/` directory

# Install

```
npm install --save-dev @dhis2/packages
# or
yarn add -D @dhis2/packages
```

# Usage

```
packages help
usage: packages <command> [options]

# ... list of commands ...
```

# Adding hooks

Install [Husky](https://github.com/typicode/husky) (preferred) or another hook-manager:

```
npm install husky --save-dev
```

```
"husky": {
    "hooks": {
      "commit-msg": "packages commit-style",
      "pre-commit": "packages code-style"
    }
}
```

Once you are using those hooks, we can generate `CHANGELOG.md` for each release, e.g. as we do in [@dhis2/ui/CHANGELOG.md](https://github.com/dhis2/ui/blob/master/CHANGELOG.md).

# Release and Generate: `CHANGELOG.md`, tags, etc.

We use [standard-version](https://github.com/conventional-changelog/standard-version) to generate release information.

_N.B._: The first time a release is cut use the first-release option: `packages release --first-release`

To do a subsequent release, run `packages release`.

```
packages release help
usage: packages release [options]

[... list of options ...]
```

After that run `git push --follow-tags origin master`. **DO NOT RUN `npm publish`. Travis does this when it builds a tag.**

# Yarn/NPM?

Packages supports both tools but yields to Yarn if there exists both a `yarn.lock` and a `package-lock.json` file.

## Monorepos

And example implementation of a monorepo with workspaces is here: [d2-ui/package.json](https://github.com/dhis2/d2-ui/blob/master/package.json).

The `packages exec` command is important for monorepos as it runs the given command with its arguments on each of the sub-packages inside of `${repo}/packages/`.

Common configuration could be to add the following scripts:

```
    "build": "packages build",
    "watch": "packages exec yarn watch",
    "lint": "packages exec yarn lint",
```

### NPM/Yarn without workspaces

Packages supports monorepos without using the concept of workspaces, but it makes some assumptions about how the project is structured:

-   all packages are inside `${repo}/packages/`
-   devs need to run `packages install` which then runs `install` in each sub-package

The workflow would be:

```
packages install
packages link
packages build
```

`packages install` takes care to first run the `install` command in the `${repo}/`, and then running `install` in each sub-package in parallel.

### Yarn Workspaces

Using workspaces, a developer could simplify the workflow with the configuration:

```
  "scripts": {
    "postinstall": "packages link",
  },
  "workspaces": [
    "packages/*",
    "examples/*"
  ],
```

Yielding the workflow:

```
yarn install
packages build
```

`yarn install` with workspaces enabled automatically installs all dependencies for the sub-packages in one go.
