const fs = require('fs')
const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const chalk = require('chalk')

/**
 * @param {string} inDir
 * @param {string} outDir
 * @return {void}
 */
const checkIODirectories = (inDir, outDir) => {
    const inDirExists = fs.existsSync(inDir) && fs.statSync(inDir).isDirectory()
    const outDirExists =
        fs.existsSync(outDir) && fs.statSync(outDir).isDirectory()

    if (!inDirExists) {
        reporter.error(
            `Input path ${chalk.bold(
                path.relative(process.cwd(), inDir)
            )} does not exist or is not a directory`
        )
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
}

/**
 * @param {string} inDir
 * @param {string} primaryLanguage
 * @param {string[]} translationFiles
 * @return {void}
 */
const checkMainTranslationFilePresent = (
    inDir,
    primaryLanguage,
    translationFiles
) => {
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
    checkIODirectories,
    checkMainTranslationFilePresent,
}
