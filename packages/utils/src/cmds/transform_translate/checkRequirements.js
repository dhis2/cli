const fs = require('fs')
const log = require('@dhis2/cli-helpers-engine').reporter

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
    const inDirExists = fs.existsSync(argv.inDir)
    const outDirExists = fs.existsSync(argv.outDir)

    if (!appNamePattern.test(argv.appName)) {
        log.error(exports.builder.appName.describe)
        log.error(`Received: ${argv.appName}`)
        process.exit(1)
    }

    if (!inDirExists) {
        log.error(`Input directory does not exist ("${argv.inDir}")`)
        process.exit(1)
    } else {
        log.debug(`Input directory exists ("${argv.inDir}")`)
    }

    if (!outDirExists) {
        log.debug(`Creating output dir: ${argv.outDir}`)
        fs.mkdirSync(argv.outDir, { recursive: true })
    } else {
        log.info('Output dir already exists, skip creating it')
    }

    const mainTranslationFile = translationFiles.find(file =>
        file.match(`i18n_module_${argv.primaryLanguage}.properties`)
    )
    const mainTranslationFilePath = path.join(argv.inDir, mainTranslationFile)

    if (!fs.existsSync(mainTranslationFilePath)) {
        log.error(
            `Main language file must exist ("${path.join(
                argv.inDir,
                mainTranslationFile
            )}")`
        )
        process.exit(1)
    }
}

module.exports = {
    checkRequirements,
}
