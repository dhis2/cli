const fs = require('fs')
const { reporter } = require('@dhis2/cli-helpers-engine')

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
                reporter.debug(`Deleted old file:`)
                reporter.debug(`"${filePathToDelete}"`)
            } catch (e) {
                reporter.error('Could not delete old translation file')
                reporter.error(e.message)
            }
        }
    })
}

module.exports = {
    deleteLegacyFiles,
}
