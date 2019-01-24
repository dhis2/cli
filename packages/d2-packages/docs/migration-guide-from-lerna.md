## Migrate steps from Lerna to Packages

To migrate away from Lerna there are a couple of steps to be aware off:

-   Remove `lerna.json`
-   Remove `lerna` from dependencies
-   Re-write `scripts` commands with `packages` instead of `lerna`

    -   `lerna exec <cmd>` becomes `packages exec <cmd>`
    -   `lerna run build` becomes `packages build`

-   Add `version` property to root-level `package.json` with a version
-   Add `private` propertry with value `false` in root-level
    `package.json`
-   In each package in `packages/`
    -   Add `version` property with value `0.0.0-PLACEHOLDER`.
    -   Make sure there is a `build` script which produces a production
        build
