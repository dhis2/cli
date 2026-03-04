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
                                            React Router, or GitHub
                                            template specifier)         [string]
  --packageManager, --package,              Package Manager
  --packagemanager                                                      [string]
```

## Community templates

The CLI also supports installing templates developed by the community using a GitHub repository URL or `owner/repo` specifier. These templates are maintained outside the CLI, so you should review the source code before using them in your project.

Here are some of the available community templates:

### Tailwind + React Router

React Router DHIS2 app template with Tailwind CSS.

Repository: [https://github.com/derrick-nuby/dhis2-ts-tailwind-react-router](https://github.com/derrick-nuby/dhis2-ts-tailwind-react-router)

```sh
pnpm create @dhis2/app my-app --template https://github.com/derrick-nuby/dhis2-ts-tailwind-react-router
```

Main components: Tailwind CSS, React Router
Organisation: HISP Rwanda
Developed by: [Derrick Iradukunda](https://github.com/derrick-nuby)

If you would like to promote your own community template, you can open a PR
for the [CLI docs](https://github.com/dhis2/cli/blob/master/docs/commands/create-app.md)
including template URL and installation steps, and any other relevant
information.

## Examples

Here are some examples of how you can use the CLI

```sh
# create a new app using the default settings (pnpm, TypeScript, basic template)
pnpm create @dhis2/app my-app --yes

# use the default settings but override the template
pnpm create @dhis2/app my-app --yes --template react-router

# use a custom template from GitHub (owner/repo)
pnpm create @dhis2/app my-app --template owner/repo

# use a custom template from GitHub with a branch/tag/commit
pnpm create @dhis2/app my-app --template owner/repo#main

# use a full GitHub URL
pnpm create @dhis2/app my-app --template https://github.com/owner/repo

# use yarn as a package manager (and prompt for other settings)
pnpm create @dhis2/app my-app --packageManager yarn

# use yarn, JavaScript and the react-router template
pnpm create @dhis2/app my-app --packageManager yarn --no-typescript --template react-router

# run in debug mode
pnpm create @dhis2/app my-app --debug
```
