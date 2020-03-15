# Schema

> A part of the [@dhis2/cli](https://github.com/dhis2/cli)
> commandline interface.

Utility tools that operate on DHIS2-schemas.

## Diff

Diffs DHIS2-schemas. Can use running DHIS2 instances as input, which will download the schemas and diff these, providing a a variety of [formats](#--format). This is useful to show changes between versions / revisions. Can also use files from the [_fetch_](#fetch)-command.

### Usage

#### Examples

**Note** that these examples assume that you have setup the [configuration](#configuration)-file with `baseUrl: https://play.dhis2.org`

Basic usage; downloads schemas from the [play](https://play.dhis2.org/)-server and outputs a format akin to `git diff` to the terminal.

```bash
d2 utils schema diff /2.31 /2.32dev
```

Output a html file with the version and revision in the filename to the current working directory. Open the file in the browser, using OSX's [open](https://ss64.com/osx/open.html). See [xdg-open](https://linux.die.net/man/1/xdg-open) for a linux equivalent.

```bash
d2 utils schema diff /2.31 /2.32dev --format html -o | xargs open
```

**Note** that to use relative urls they must start with `/`. If not, the url will be assumed to be absolute and the request will fail

Use absolute URLs. Output html-file to home/Documents directory.

```bash
d2 utils schema diff https://birk.dev/master https://play.dhis2.org/dev/ --format html -o ~/Documents/
```

### Options

##### --auth

If true a prompt will ask for username and password for each server.
Note that you can still provide authentication from `config.js`. If the flag is omitted or `--auth=false` credentials from `config.js` will be read. Note that the prompt is shown if no credentials can be resolved from the [configuration](#configuration)-file.

##### --output, -o

Specify the location of the output. If used as a flag (no arguments) a
file relative to current working directory is generated with the name
"LEFT-version_revision\_\_RIGHT-version_revision.html".
If the location is a directory, the default filename is
used and output to location.
The output of the program changes to this path-location, so it can be combined with pipe. Eg
`d2 utils schema diff /2.31 /2.32 --format html -o | xargs open`
will pass the path to `xargs open`, and open the html-diff in your browser.

##### --format

Specify the format of the output. Can be one of `["html", "json", "console"]`.

JSON is the raw output of [jsondiffpatch](https://github.com/benjamine/jsondiffpatch/blob/master/docs/arrays.md), see the [delta format](https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md) for information about this format.

Default: console.

##### --base-url, -b

Base-Url to use for downloading schemas. If this is set leftServer and rightServer should be relative to this url, eg. /dev. Note the leading slash for the relative urls.

##### --ignore-array-order

The server returns non-deterministic ordering of arrays. Enabling this will prevent most internal array moves, which are probably irrelevant anyway.

### Configuration

Many of the above options may be provided through the `d2` configuration file, which by default is located at `~/.config/d2/config.js`. This is especially useful for credentials. The file is namespaced by command, an example of such a file:

```
module.exports = {
    utils: {
        schema: {
            username: 'admin',
            password: 'district',
            baseUrl: 'https://play.dhis2.org',
            rightServer: {
                username: 'system',
                password: 'System123',
            },
        }
    },
}
```

Authorization is handled in the following way:

-   Per-server configuration (e.g. leftServer) is read first, if either password or username are non-existant or blank, the `schema`-level are used.
-   If `schema`-level configuration is blank, an interactive prompt for username and password will be shown.

In the example configuration file above, `leftServer` will use schema-level credentials (admin, district), while `rightServer` will use `john, district`,

## Fetch

Fetches schemas from a _running_ DHIS2 instance. The schemas are compatible with the _diff_-command.

### Usage

```
d2-utils schema fetch <urls...> [opts]
```

Fetch supports multiple urls at the same time. These can be a combination of relative and absolute urls if baseUrl is set. Note that `--output` will in this case always resolve to the directory part of the output-path.

#### Examples

Downloads schemas relative to working directory with auto-generated name.

```
d2 utils schema fetch https://play.dhis2.org/dev -o
```

Combination of relative and absolute urls. Note that the protocol is not needed. `https` is prepended if the urls does _not_ start with `/`. This is the reason why it's important to start relative urls with `/`.

```
d2 utils schema fetch https://play.dhis2.org/dev birk.dev/master /2.32 --base-url play.dhis2.org -o
```

##### With Diff command

It's possible to use a one-liner to download the schemas and pipe this file location to the [diff](#diff)-command. The following example will download the schemas to the current working directory, while downloading `2.31` schemas and diffing these. Output is an html file in the current directory.

```
d2 utils schema fetch https://play.dhis2.org/dev -o | xargs d2 utils schema diff /2.31 -o --format html
```

### Configuration

Configuration is mostly identical to the Diff command. However, options are only read from the `schema`-object. This is mostly useful for credentials and `base-url`.

### Options

##### --auth

See [auth](#--auth)

##### --output, -o

See [output](#--output). In addition, if multiple urls are given, the path will be resolved to the [directory-path](https://nodejs.org/api/path.html#path_path_dirname_path).

##### --base-url, -b

Base-Url to use for downloading schemas. If this is set, urls that are relative (starts with `/`) will be appended to this url. eg. /dev. Note the leading slash for the relative urls.
