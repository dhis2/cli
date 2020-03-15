# Introduction

`d2 utils release` allows you to publish libraries and applications to
various package repositories.

# Usage

Internally the `release` command utilizes [semantic
release](https://github.com/semantic-release/semantic-release), so
understanding how that tool operates is helpful.

Simply put, every time a commit appears on the `master` branch, the
fully automated release process begins, and the commit is released.

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
