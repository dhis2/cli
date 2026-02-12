---
title: Create a new app
sidebar_label: Create new app
id: create-app
slug: '/cli/create-app'
---

# @dhis2/create-app

This package publishes a package that follows the convention of [npm create](https://docs.npmjs.com/cli/v11/commands/npm-init#synopsis).

This allows users to create a new DHIS2 web application by running the command:

```sh
# with pnpm
pnpm create @dhis2/app project-name --yes
#
```

```sh
# with npm
npx @dhis2/create-app --yes
# or npm create @dhis2/app -- --yes
```

By passing `--yes` argument, this will create a new DHIS2 web application using the default options without prompting (using `pnpm` as a package manager, and `TypeScript` as the language, and the default `basic` template).

If you omit the `--yes` argument (`pnpm create @dhis2/app project-name`), then you will be prompted and guided through a wizard to choose your options.

You can run the commands in `debug` mode to get more verbose logs by passing the `--debug` option (`pnpm create @dhis2/app project-name --debug`).

# CLI options

Instead of going through the wizard, you can pass arguments to specify the options to use when creating a new app.

You can run `pnpm create @dhis2/app@alpha --help` for the list of options available:

```sh
--yes, -y                                 Skips interactive setup questions,
                                            using default options to create the
                                            new app (TypeScript, pnpm, basic
                                            template) [boolean] [default: false]
  --typescript, --ts, --typeScript          Use TypeScript or JS       [boolean]
  --template                                Which template to use (Basic, With
                                            React Router)               [string]
  --tailwind                                Enable Tailwind CSS setup   [boolean]
  --packageManager, --package,              Package Manager
  --packagemanager                                                      [string]
```

## Examples

Here are some examples of how you can use the CLI

```sh
# create a new app using the default settings (pnpm, TypeScript, basic template)
pnpm create @dhis2/app my-app --yes

# use the default settings but override the template
pnpm create @dhis2/app my-app --yes --template react-router

# use optional Tailwind CSS setup with the basic template
pnpm create @dhis2/app my-app --yes --tailwind

# use optional Tailwind CSS setup with the react-router template
pnpm create @dhis2/app my-app --yes --template react-router --tailwind

# use yarn as a package manager (and prompt for other settings)
pnpm create @dhis2/app my-app --packageManager yarn

# use yarn, JavaScript and the react-router template
pnpm create @dhis2/app my-app --packageManager yarn --no-typescript --template react-router

# run in debug mode
pnpm create @dhis2/app my-app --debug
```
