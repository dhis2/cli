# Schema

> A part of the [@dhis2/cli](https://github.com/dhis2/cli)
> commandline interface.

Utility tools that operate on DHIS2-schemas.

## Diff

Diffs DHIS2-schemas. Can use running DHIS2 instances as input, which will download the schemas and diff these. This is useful to show changes between versions / revisions. Can also use files from the [*fetch*](#fetch)-command.

### Usage

#### Examples
Basic usage; downloads schemas from the [play](https://play.dhis2.org/)-server and outputs a format akin to `git diff` to the terminal.
```bash
d2 utils schema diff /2.31 /2.32dev
```
Output a html file with the version and revision in the filename to the current working directory. Open the file in the browser, using OSX's [open](https://ss64.com/osx/open.html). See [xdg-open](https://linux.die.net/man/1/xdg-open) for a linux equivalent.
```bash
d2 utils schema diff /2.31 /2.32dev --format html -o | xargs open
```

Use absolute URLs. Output html-file to home/Documents directory.
```bash
d2 utils schema diff https://birk.dev/master https://play.dhis2.org/dev/ --format html -o ~/Documents/
```

The server returns non-deterministic ordering of arrays. The arrays can be sorted before diffing, which will prevent most irrelevant array-moves.

#### Options

##### --output, -o          
Specify the location of the output. If used as a flag (no arguments) a
file relative to current working directory is generated with the name
"LEFT-version_revision__RIGHT-version_revision.html".
If the location is a directory, the default filename is
used and output to location.
The output of the program changes to this path-location, so it can be combined with pipe. Eg 
`d2 utils schema diff /2.31 /2.32 --format html -o | xargs open`
will pass the path to `xargs open`, and open the html-diff in your browser.

##### --format
Specify the format of the output. Can be one of `["html", "json", "console"]`. 

JSON is the raw output of [jsondiffpatch](https://github.com/benjamine/jsondiffpatch/blob/master/docs/arrays.md), see the [delta format](https://github.com/benjamine/jsondiffpatch/blob/master/docs/deltas.md) for information about this format.

Default: console.

## Fetch

Fetches schemas from a _running_ DHIS2 instance. The schemas are compatible with the *diff*-command.

