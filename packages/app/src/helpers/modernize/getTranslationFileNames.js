const fs = require('fs')
const {
    checkIODirectories,
    checkMainTranslationFilePresent,
} = require('./checkRequirements')

const fileIsOldTranslationFile = (fileName) => fileName.match(/\.properties$/)

/**
 * @param {Object} args
 * @param {string} args.inDir
 * @param {string} args.outDir
 * @param {string} args.primaryLanguage
 * @return {string[]}
 */
const getTranslationFileNames = ({ inDir, outDir, primaryLanguage }) => {
    checkIODirectories(inDir, outDir)

    const translationFiles = fs
        .readdirSync(inDir)
        .filter(fileIsOldTranslationFile)

    checkMainTranslationFilePresent(inDir, primaryLanguage, translationFiles)

    return translationFiles
}

module.exports = {
    getTranslationFileNames,
}
