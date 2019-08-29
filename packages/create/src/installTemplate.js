const path = require('path')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const { reporter } = require('@dhis2/cli-helpers-engine')
const chalk = require('chalk')

const textExtensionsRegex = /txt|md|html|[jt]s(x?)|rtf|csv|json/

const walkDir = async (rootDir, fn) => {
    const children = fs.readdirSync(rootDir)
    return Promise.all(
        children.map(async child => {
            const childPath = path.join(rootDir, child)
            if (fs.statSync(childPath).isDirectory()) {
                return await walkDir(childPath, fn)
            } else {
                return await fn(childPath)
            }
        })
    )
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
    const dest = replacePathVariables(outFile, data)

    reporter.debug(`Installing ${dest} from ${inFile}`)
    fs.ensureDirSync(path.dirname(dest))
    fs.writeFileSync(dest, template(data))
}

const installTemplate = async (src, dest, data) => {
    await walkDir(src, p => {
        const outPath = path.join(dest, path.relative(src, p))
        if (textExtensionsRegex.test(path.extname(p))) {
            writeTemplate(p, outPath, data)
        } else {
            fs.copyFileSync(p, outPath)
        }
        // if (fs.accessSync(p, fs.X_OK)) {
        //     fs.chmodSync(outPath, 'rwx')
        // }
    })
}

module.exports = installTemplate
module.exports.walkDir = walkDir
