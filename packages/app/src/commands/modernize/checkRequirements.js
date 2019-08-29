const fs = require('fs')
const path = require('path')
const log = require('@dhis2/cli-helpers-engine').reporter

const appNamePattern = new RegExp('[a-z]+(-[a-z]+)?-app')

/**
 * @param {Object} args
 * @param {string} args.inDir
 * @param {string} args.outDir
 * @param {string} args.appName
 * @param {string} args.primaryLanguage
 * @param {string[]} args.translationFiles
 * @return {void}
 */
const checkRequirements = ({
    inDir,
    outDir,
    appName,
    primaryLanguage,
    translationFiles,
}) => {
    const inDirExists = fs.existsSync(inDir)
    const outDirExists = fs.existsSync(outDir)

    if (!appNamePattern.test(appName)) {
        log.error(exports.builder.appName.describe)
        log.error(`Received: ${appName}`)
        process.exit(1)
    }

    if (!inDirExists) {
        log.error(`Input directory does not exist ("${inDir}")`)
        process.exit(1)
    } else {
        log.debug(`Input directory exists ("${inDir}")`)
    }

    if (!outDirExists) {
        log.debug(`Creating output dir: ${outDir}`)
        fs.mkdirSync(outDir, { recursive: true })
    } else {
        log.info('Output dir already exists, skip creating it')
    }

    const mainTranslationFile = translationFiles.find(file =>
        file.match(`i18n_module_${primaryLanguage}.properties`)
    )
    const mainTranslationFilePath = path.join(inDir, mainTranslationFile)

    if (!fs.existsSync(mainTranslationFilePath)) {
        log.error(
            `Main language file must exist ("${path.join(
                inDir,
                mainTranslationFile
            )}")`
        )
        process.exit(1)
    }
}

module.exports = {
    checkRequirements,
}
