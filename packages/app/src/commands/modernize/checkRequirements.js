const fs = require('fs')
const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')

/**
 * @param {Object} args
 * @param {string} args.inDir
 * @param {string} args.outDir
 * @param {string} args.primaryLanguage
 * @param {string[]} args.translationFiles
 * @return {void}
 */
const checkRequirements = ({
    inDir,
    outDir,
    primaryLanguage,
    translationFiles,
}) => {
    const inDirExists = fs.existsSync(inDir)
    const outDirExists = fs.existsSync(outDir)

    if (!inDirExists) {
        reporter.error(`Input directory does not exist ("${inDir}")`)
        process.exit(1)
    } else {
        reporter.debug(`Input directory exists ("${inDir}")`)
    }

    if (!outDirExists) {
        reporter.debug(`Creating output dir: ${outDir}`)
        fs.mkdirSync(outDir, { recursive: true })
    } else {
        reporter.info('Output dir already exists, skip creating it')
    }

    const mainTranslationFile = translationFiles.find(file =>
        file.match(`i18n_module_${primaryLanguage}.properties`)
    )
    const mainTranslationFilePath = path.join(inDir, mainTranslationFile)

    if (!fs.existsSync(mainTranslationFilePath)) {
        reporter.error(
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
