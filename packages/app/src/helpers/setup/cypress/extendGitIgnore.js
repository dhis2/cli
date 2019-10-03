const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs')
const path = require('path')
const write = require('./write')

const extendGitIgnore = rootDir => {
    write({
        rootDir,
        filePath: '.gitignore',
        content: 'cypress.env.json',
        options: { flag: 'a' },
    })
}

module.exports = extendGitIgnore
