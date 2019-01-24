# Monorepo setup

## Monorepo with NPM

#### Example `package.json`

```
{
  "scripts": {
    "postinstall": "packages install && packages link",
    "build": "packages build",
    "watch": "packages exec yarn watch",
  }
}
```

#### Workflow

```
# day-to-day cmds

npm install
npm run build
npm run watch
npm run format
```

## Monorepo with Yarn Workspaces

#### Example `package.json`

```
{
  "scripts": {
    "postinstall": "packages link",
    "build": "packages build",
    "watch": "packages exec yarn watch",
  },
  "workspaces": [
    "packages/*"
  ]
}
```

#### Workflow

With [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/), a single
`yarn install` at the root-level installs any dependencies in the folders in
the `workspaces` array, which also hoists any common dependencies to the
root-level `node_modules/`.

```
# day-to-day cmds

yarn install
yarn build
yarn watch
yarn format
```
