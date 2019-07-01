# [1.3.0](https://github.com/dhis2/cli/compare/v1.2.4...v1.3.0) (2019-07-01)


### Features

* decouple configs from cluster ([#53](https://github.com/dhis2/cli/issues/53)) ([e5b40af](https://github.com/dhis2/cli/commit/e5b40af))

## [1.2.4](https://github.com/dhis2/cli/compare/v1.2.3...v1.2.4) (2019-06-13)


### Bug Fixes

* use dhis2/docker-compose instead of amcgee/dhis2-backend as default ([#61](https://github.com/dhis2/cli/issues/61)) ([85d708f](https://github.com/dhis2/cli/commit/85d708f))

## [1.2.3](https://github.com/dhis2/cli/compare/v1.2.2...v1.2.3) (2019-06-12)


### Bug Fixes

* avoid double parsing of arguments ([#64](https://github.com/dhis2/cli/issues/64)) ([b616152](https://github.com/dhis2/cli/commit/b616152))

## [1.2.2](https://github.com/dhis2/cli/compare/v1.2.1...v1.2.2) (2019-05-27)


### Bug Fixes

* use the resolved db dump url ([#56](https://github.com/dhis2/cli/issues/56)) ([0f26ad1](https://github.com/dhis2/cli/commit/0f26ad1))

## [1.2.1](https://github.com/dhis2/cli/compare/v1.2.0...v1.2.1) (2019-05-27)


### Bug Fixes

* resolve dockerComposeRepository from defaults if cluster undefined ([#55](https://github.com/dhis2/cli/issues/55)) ([39fc0c7](https://github.com/dhis2/cli/commit/39fc0c7))

# [1.2.0](https://github.com/dhis2/cli/compare/v1.1.0...v1.2.0) (2019-05-27)


### Features

* support official docker images ([#54](https://github.com/dhis2/cli/issues/54)) ([8e2a6da](https://github.com/dhis2/cli/commit/8e2a6da))

# [1.1.0](https://github.com/dhis2/cli/compare/v1.0.5...v1.1.0) (2019-05-23)


### Features

* decouple tag, name, and version ([#46](https://github.com/dhis2/cli/issues/46)) ([28e88e4](https://github.com/dhis2/cli/commit/28e88e4))

## [1.0.5](https://github.com/dhis2/cli/compare/v1.0.4...v1.0.5) (2019-05-14)


### Bug Fixes

* update @dhis2/cli style 3.2.1 ([#49](https://github.com/dhis2/cli/issues/49)) ([c375f8d](https://github.com/dhis2/cli/commit/c375f8d)), closes [#48](https://github.com/dhis2/cli/issues/48) [#48](https://github.com/dhis2/cli/issues/48)

## [1.0.4](https://github.com/dhis2/cli/compare/v1.0.3...v1.0.4) (2019-05-14)


### Bug Fixes

* update @dhis2/cli-helpers-engine in group default to the latest version 🚀 ([#47](https://github.com/dhis2/cli/issues/47)) ([6139000](https://github.com/dhis2/cli/commit/6139000))

## [1.0.3](https://github.com/dhis2/cli/compare/v1.0.2...v1.0.3) (2019-05-13)


### Bug Fixes

* **cluster:** expose the version as an environment variable in the context ([#39](https://github.com/dhis2/cli/issues/39)) ([7e8e8dd](https://github.com/dhis2/cli/commit/7e8e8dd))

## [1.0.2](https://github.com/dhis2/cli/compare/v1.0.1...v1.0.2) (2019-03-28)


### Bug Fixes

* upgrade @dhis2/cli-helpers-engine and @dhis2/cli-style ([#35](https://github.com/dhis2/cli/issues/35)) ([251ac22](https://github.com/dhis2/cli/commit/251ac22))

## [1.0.1](https://github.com/dhis2/cli/compare/v1.0.0...v1.0.1) (2019-03-27)


### Bug Fixes

* seed from file variable name was misspelled ([#33](https://github.com/dhis2/cli/issues/33)) ([6109c95](https://github.com/dhis2/cli/commit/6109c95))

# [1.0.0](https://github.com/dhis2/cli/compare/v0.14.0...v1.0.0) (2019-03-25)


### Features

* upgrade cli-helpers-engine and cli-style dependencies ([#32](https://github.com/dhis2/cli/issues/32)) ([21c78dd](https://github.com/dhis2/cli/commit/21c78dd))


### BREAKING CHANGES

* cut major version 1.0.0

* chore: update cli-helpers-engine and cli-style dependencies

* chore: let greenkeeper watch the create cli template

# [0.14.0](https://github.com/dhis2/cli/compare/v0.13.0...v0.14.0) (2019-03-25)


### Features

* one dot oh! ([#28](https://github.com/dhis2/cli/issues/28)) ([207ae93](https://github.com/dhis2/cli/commit/207ae93))

# [0.13.0](https://github.com/dhis2/cli/compare/v0.12.1...v0.13.0) (2019-03-25)


### Bug Fixes

* don't update the package.json version before npm stage ([#25](https://github.com/dhis2/cli/issues/25)) ([5909f78](https://github.com/dhis2/cli/commit/5909f78))


### Features

* semantic release update deps ([#24](https://github.com/dhis2/cli/issues/24)) ([d2c155e](https://github.com/dhis2/cli/commit/d2c155e))

## [0.12.1](https://github.com/dhis2/cli/compare/v0.12.0...v0.12.1) (2019-03-22)


### Bug Fixes

* add scripts subcommand ([#23](https://github.com/dhis2/cli/issues/23)) ([bb36a22](https://github.com/dhis2/cli/commit/bb36a22))
* publish multiple packages from inside a package ([#22](https://github.com/dhis2/cli/issues/22)) ([6012782](https://github.com/dhis2/cli/commit/6012782))
