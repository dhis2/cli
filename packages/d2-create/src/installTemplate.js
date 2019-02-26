const path = require('path')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const { reporter } = require('@dhis2/cli-helpers-engine')
const chalk = require('chalk')

const walkDir = (rootDir, fn) => {
    const children = fs.readdirSync(rootDir)
    children.forEach(child => {
        const childPath = path.join(rootDir, child)
        if (fs.statSync(childPath).isDirectory()) {
            walkDir(childPath, fn)
        } else {
            fn(childPath)
        }
    })
}

const replacePathVariables = (initialPath, data) => {
    let finalPath = initialPath
    Object.keys(data).forEach(key => {
        finalPath = finalPath.replace(RegExp(`{{${key}}}`, 'g'), data[key])
    })
    return finalPath
}
const writeTemplate = (inFile, outFile, data) => {
    const hbs = fs.readFileSync(inFile, 'utf8')
    const template = handlebars.compile(hbs)
    let dest = replacePathVariables(outFile, data)

    reporter.debug(`Installing ${dest} from ${inFile}`)
    fs.ensureDirSync(path.dirname(dest))
    fs.writeFileSync(dest, template(data))
}

const installTemplate = (type, outDir, data) => {
    const rootDir = path.join(__dirname, '../templates', type)
    reporter.debug(`Installing template ${chalk.bold(type)}`)
    reporter.debug('  outDir:', outDir)
    reporter.debug('  data:  ', data)
    walkDir(rootDir, p => {
        const outPath = path.join(outDir, path.relative(rootDir, p))
        writeTemplate(p, outPath, data)
    })
}

module.exports = installTemplate
