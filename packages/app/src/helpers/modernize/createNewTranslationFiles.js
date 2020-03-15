const path = require('path')
const fs = require('fs')
const { reporter } = require('@dhis2/cli-helpers-engine')

const {
    getTemplateMainLanguage,
    getTemplateAlternativeLanguage,
} = require('./getTemplates.js')
const {
    LENGTH_TO_SPLIT_LINE_AT,
    splitTranslation,
} = require('./splitTranslation.js')

/**
 * @param {Object} args
 * @param {string} args.outDir
 * @param {string} args.pootlePath
 * @param {Object} args.creationDate
 * @param {Object} args.translations
 * @param {boolean} args.logMissingKeys
 * @param {string} args.primaryLanguage
 * @param {string[]} args.languagesToTransform
 * @param {boolean} args.overrideExistingFiles
 * @param {boolean} args.appendToExistingFiles
 * @return {void}
 */
const createNewTranslationFiles = ({
    outDir,
    pootlePath,
    translations,
    creationDate,
    logMissingKeys,
    primaryLanguage,
    languagesToTransform,
    overrideExistingFiles,
    appendToExistingFiles,
}) => {
    for (const language in translations) {
        if (Object.prototype.hasOwnProperty.call(translations, language)) {
            if (
                languagesToTransform.length &&
                languagesToTransform.indexOf(language) === -1
            ) {
                continue
            }

            const newLanguageFileName =
                language === primaryLanguage
                    ? `${language}.pot`
                    : `${language}.po`

            let newContents = ''
            const languageTranslations = translations[language]
            const newLanguageFilePath = path.join(outDir, newLanguageFileName)

            if (
                !overrideExistingFiles &&
                fs.existsSync(newLanguageFilePath) &&
                !appendToExistingFiles
            ) {
                reporter.print('')
                reporter.print(
                    `Creating translation file for "${language}" :: Skipped`
                )
                reporter.print(
                    `Translation file ("${newLanguageFilePath}") already exists.`
                )
                reporter.print(
                    `If you want to append the translations, use the "--append-to-existing-files" option.`
                )
                reporter.print(
                    `If you want to override the existing files, use the "--override-existing-files" option`
                )

                continue
            } else if (
                overrideExistingFiles ||
                !fs.existsSync(newLanguageFilePath)
            ) {
                newContents +=
                    language === primaryLanguage
                        ? getTemplateMainLanguage(creationDate)
                        : getTemplateAlternativeLanguage(
                              language,
                              creationDate,
                              pootlePath
                          )
            }

            for (const key in languageTranslations) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        languageTranslations,
                        key
                    )
                ) {
                    if (!translations[primaryLanguage][key]) {
                        logMissingKeys &&
                            reporter.info(
                                `Original translation missing for key "${key}" of language "${language}"`
                            )
                        continue
                    }

                    const originalTranslation =
                        translations[primaryLanguage][key]

                    const translation =
                        language === primaryLanguage
                            ? ''
                            : languageTranslations[key]

                    newContents += '\n\n'
                    if (originalTranslation.length < LENGTH_TO_SPLIT_LINE_AT) {
                        newContents += `msgid "${originalTranslation}"\n`
                    } else {
                        newContents += `msgid ""\n`
                        const newLines = splitTranslation(originalTranslation)
                        newLines.forEach(translationPart => {
                            newContents += `"${unescape(translationPart)}"\n`
                        })
                    }

                    if (translation.length < LENGTH_TO_SPLIT_LINE_AT) {
                        newContents += `msgstr "${translation}"`
                    } else {
                        newContents += `msgstr ""\n`
                        const newLines = splitTranslation(translation)
                        newLines.forEach(translationPart => {
                            newContents += `"${unescape(translationPart)}"\n`
                        })
                    }
                }
            }

            const shouldAppendContents =
                !overrideExistingFiles &&
                fs.existsSync(newLanguageFilePath) &&
                appendToExistingFiles

            reporter.info(
                `${
                    shouldAppendContents ? 'Appending' : 'Writing'
                } to "${newLanguageFilePath}"`
            )
            fs.writeFileSync(newLanguageFilePath, newContents, {
                flag: shouldAppendContents ? 'a' : 'w',
            })
        }
    }
}

module.exports = {
    createNewTranslationFiles,
}
