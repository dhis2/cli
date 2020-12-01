# Introduction

`d2 utils release` allows you to publish libraries and applications to
various package repositories.

# Usage

Internally the `release` command utilizes [semantic
release](https://github.com/semantic-release/semantic-release), so
understanding how that tool operates is helpful.

Simply put, every time a commit appears on the `master` branch, the
fully automated release process begins, and the commit is released.

In detail when a commit that utilizes semantic release appears on `master` the following will happen:

1. A Github release similar to [this one](https://github.com/dhis2/usage-analytics-app/releases)
   will be created.

2. The `CHANGELOG.md` file will be updated. An example can be found
   [here](https://github.com/dhis2/usage-analytics-app/blob/master/CHANGELOG.md).
   _The first release will automatically create a `CHANGELOG.md` in the root directory of your repository._

3. The versions in the `package.json` will be updated as well.

4. And finally it will push the relevant tags.

# Advanced usage

## Distribution channels

We support the default channels recommended by semantic release, and
there is a [good
walkthrough](https://github.com/semantic-release/semantic-release/blob/master/docs/recipes/distribution-channels.md)
of them available on their docs.

Our [GH Actions
workflow](https://github.com/dhis2/workflows/blob/master/ci/node-publish.yml#L5)
is kept in sync with those defaults.

It is possible to e.g. only use the `master` branch for releases by
restricting the `on.push.branches` list in the workflow file in the
local repo.
