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

By passing `--yes` argument, this will create a new DHIS2 web application using the default options without prompting (using `pnpm` as a package manager, and `TypeScript` as the language).

If you omit the `--yes` argument `pnpm create @dhis2/app project-name` then you will be prompted and guided through a wizard to choose your options.

You can run the commands in `debug` mode to get more verbose logs by passing the `--debug` option (`pnpm create @dhis2/app project-name --debug`).
