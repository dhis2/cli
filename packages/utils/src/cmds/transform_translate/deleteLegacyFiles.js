const fs = require('fs')
const log = require('@dhis2/cli-helpers-engine').reporter

/**
 * @param {Object} args
 * @param {string[]} args.translationFiles
 * @param {string[]} args.languagesToTranslate
 * @returns {void}
 */
const deleteLegacyFiles = ({ translationFiles, languagesToTransform }) => {
    translationFiles.forEach(file => {
        const language = file.replace(/i18n_module_|.properties/g, '')

        if (
            !languagesToTransform.length ||
            languagesToTransform.indexOf(language) !== -1
        ) {
            try {
                const filePathToDelete = path.join(inDir, file)
                fs.unlinkSync(filePathToDelete)
                log.debug(`Deleted old file:`)
                log.debug(`"${filePathToDelete}"`)
            } catch (e) {
                log.error('Could not delete old translation file')
                log.error(e.message)
            }
        }
    })
}

module.exports = {
    deleteLegacyFiles,
}
