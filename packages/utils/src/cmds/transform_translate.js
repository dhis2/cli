/**
 * Example usage:
 *
 * d2-utils transform_translate \
 *   --in-dir ~/development/dhis2/maintenance-app/src/i18n \
 *   --out-dir ~/development/dhis2/project-doom/i18n \
 *   --override-existing-files \
 *   --app-name maintenance-app \
 *   --languages fr,ar \
 *   --delete-old-files \
 *   --log-missing-keys
 */
const path = require('path')
const fs = require('fs')
const log = require('@dhis2/cli-helpers-engine').reporter

const CONSUMING_ROOT = path.join(process.cwd())
const TRANSLATION_IN_DIR = path.join(CONSUMING_ROOT, 'src/i18n')
const TRANSLATION_OUT_DIR = path.join(CONSUMING_ROOT, 'i18n')

const LENGTH_TO_SPLIT_LINE_AT = 77
const fileIsOldTranslationFile = fileName => fileName.match(/\.properties$/)
const appNamePattern = new RegExp('[a-z]+(-[a-z]+)?-app')

/**
 * \u[a-zA-Z0-9] will be interpreted as unicode characters and need to be escaped.
 * The escaped sequence will look like this: %5Cu[a-zA-Z0-9]
 *
 * The translation needs to be split by whitespaces first in order to create the
 * correct structure of the new translation
 */
const splitTranslation = translation =>
    translation.split(' ').reduce((parts, curSplit) => {
        const latestPart = parts[parts.length - 1]
        const latestPartEscaped = escape(latestPart)
        const curSplitEscaped = escape(curSplit)

        if (
            parts.length > 0 &&
            latestPartEscaped.length + curSplitEscaped.length <
                LENGTH_TO_SPLIT_LINE_AT
        ) {
            parts[parts.length - 1] += ` ${curSplit}`
            return parts
        }

        if (curSplitEscaped.length < LENGTH_TO_SPLIT_LINE_AT) {
            parts.push(curSplit)
            return parts
        }

        curSplitEscaped.match(/.{1,76}(?=(%5Cu))?/g).forEach(escapedSplit => {
            parts.push(unescape(escapedSplit))
        })

        return parts
    }, [])

const getTemplateMainLanguage = () => `
msgid ""
msgstr ""
"Project-Id-Version: i18next-conv\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=utf-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Plural-Forms: nplurals=2; plural=(n != 1)\\n"
"POT-Creation-Date: ${new Date().toISOString()}\\n"
"PO-Revision-Date: ${new Date().toISOString()}\\n"
`

const getTemplateAlternativeLanguage = (appName, language) => `
msgid ""
msgstr ""
"Project-Id-Version: PACKAGE VERSION\\n"
"Report-Msgid-Bugs-To: \\n"
"POT-Creation-Date: ${new Date().toISOString()}\\n"
"PO-Revision-Date: ${new Date().toISOString()}\\n"
"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"
"Language-Team: LANGUAGE <LL@li.org>\\n"
"Language: ${language}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: Translate Toolkit 2.2.5\\n"
"X-Pootle-Path: /${language}/${appName}/${language}.po\\n"
"X-Pootle-Revision: 29879\n"
`

exports.command = 'transform_translate'
exports.describe = 'Transform old translation file style to new style'
exports.builder = {
    appName: {
        describe:
            'The name of the app, must be lower case, use dashes instead of whitespaces and be postfixed with "-app". Normally this should the url part of the github repo (maintenance app => "maintenance-app")',
        type: 'string',
    },

    primaryLanguage: {
        describe: 'Primary language',
        type: 'string',
        default: 'en',
    },

    languages: {
        describe:
            'A comma separated list of languages to create files for, when omitted, all are used',
        type: 'string',
    },

    deleteOld: {
        describe:
            'Deletes the old translation files, use `--no-delete-old` to keep the old files',
        type: 'boolean',
        default: 'true',
    },

    outDir: {
        describe: 'Output directory for new translation files',
        type: 'string',
        default: TRANSLATION_OUT_DIR,
    },

    inDir: {
        describe: 'Input directory where old translation files can be found',
        type: 'string',
        default: TRANSLATION_IN_DIR,
    },

    createOutDir: {
        describe:
            'Create the output dir if not existing, use `--no-create-out-dir` to exit with 1 when folder does not exist',
        type: 'boolean',
        default: 'true',
    },

    overrideExistingFiles: {
        describe: 'Overriding the contents of existing translation files',
        type: 'boolean',
        default: 'false',
    },

    appendToExistingFiles: {
        describe:
            'Appends the new contents to existing translation files, can only be used when not using `--override-existing-files`',
        type: 'boolean',
        default: 'false',
    },

    logMissingKeys: {
        describe:
            'Log keys that are present in translation files which are not present in translation file of --primary-language',
        type: 'boolean',
        default: 'false',
    },

    deleteOldFiles: {
        describe:
            'Delete the old files that were transformed (will only delete files specified with the `--language` option when present)',
        type: 'boolean',
    },
}
exports.handler = argv => {
    const inDirExists = fs.existsSync(argv.inDir)
    const outDirExists = fs.existsSync(argv.outDir)
    const languagesToTransform = argv.languages
        ? argv.languages.split(/,\s*/)
        : []

    if (!argv.appName) {
        log.error(`You need to provied an app name`)
        process.exit(1)
    }

    if (!appNamePattern.test(argv.appName)) {
        log.error(exports.builder.appName.describe)
        log.error(`Received: ${argv.appName}`)
        process.exit(1)
    }

    if (!inDirExists) {
        log.error(`Input directory does not exist ("${argv.inDir}")`)
        process.exit(1)
    } else {
        argv.verbose && log.debug(`Input directory exists ("${argv.inDir}")`)
    }

    if (argv.noCreateOutDir && !outDirExists) {
        log.error(`Output directory does not exist ("${argv.outDir}")`)
        process.exit(1)
    } else if (!argv.noCreateOutDir && !outDirExists) {
        argv.verbose && log.debug(`Creating output dir: ${argv.outDir}`)
        fs.mkdirSync(argv.outDir, { recursive: true })
    } else {
        argv.verbose && log.debug('Output dir already exists, skip creating it')
    }

    const translationFiles = fs
        .readdirSync(argv.inDir)
        .filter(fileIsOldTranslationFile)

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

    argv.verbose &&
        log.debug('Extracting key/value pairs from translation files')
    const translations = translationFiles.reduce((mappings, file) => {
        const language = file.replace(/i18n_module_|.properties/g, '')
        const contents = fs.readFileSync(path.join(argv.inDir, file), {
            encoding: 'utf8',
        })
        const lines = contents
            .split('\n')
            .filter(line => line !== '' && !line[0].match(/\s*#/))

        if (
            languagesToTransform.length &&
            // Primary language needed to build other translation files
            language !== argv.primaryLanguage &&
            languagesToTransform.indexOf(language) === -1
        ) {
            return mappings
        }

        mappings[language] = lines.reduce((mapping, line) => {
            const [key, ...textParts] = line.split('=')
            const text = textParts.join('=')

            mapping[key] = text
            return mapping
        }, {})

        return mappings
    }, {})

    for (const language in translations) {
        if (translations.hasOwnProperty(language)) {
            if (
                languagesToTransform.length &&
                languagesToTransform.indexOf(language) === -1
            ) {
                continue
            }

            const newLanguageFileName =
                language === argv.primaryLanguage
                    ? `${language}.pot`
                    : `${language}.po`

            let newContents = ''
            const languageTranslations = translations[language]
            const newLanguageFilePath = path.join(
                argv.outDir,
                newLanguageFileName
            )
            const shouldAppendContents =
                !argv.overrideExistingFiles &&
                fs.existsSync(newLanguageFilePath) &&
                argv.appendToExistingFiles

            if (
                !argv.overrideExistingFiles &&
                fs.existsSync(newLanguageFilePath) &&
                !argv.appendToExistingFiles
            ) {
                console.log('')
                log.debug(
                    `Creating translation file for "${language}" :: Skipped`
                )
                log.debug(
                    `Translation file ("${newLanguageFilePath}") already exists.`
                )
                log.debug(
                    `If you want to append the translations, use the "--append-to-existing-files" option.`
                )
                log.debug(
                    `If you want to override the existing files, use the "--override-existing-files" option`
                )

                continue
            } else if (!fs.existsSync(newLanguageFilePath)) {
                newContents +=
                    language === argv.primaryLanguage
                        ? getTemplateMainLanguage()
                        : getTemplateAlternativeLanguage(argv.appName, language)
            }

            for (const key in languageTranslations) {
                if (languageTranslations.hasOwnProperty(key)) {
                    if (!translations[argv.primaryLanguage][key]) {
                        argv.logMissingKeys &&
                            log.debug(
                                `Original translation missing for key "${key}" of language "${language}"`
                            )
                        continue
                    }

                    const originalTranslation =
                        translations[argv.primaryLanguage][key]
                    const translation =
                        language === argv.primaryLanguage
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

            argv.verbose &&
                log.debug(
                    `${
                        shouldAppendContents ? 'Appending' : 'Writing'
                    } to "${newLanguageFilePath}"`
                )
            fs.writeFileSync(newLanguageFilePath, newContents, {
                flag: shouldAppendContents ? 'a' : 'w',
            })
        }
    }

    argv.verbose && log.debug('Creating translation files :: Done')

    if (argv.deleteOldFiles) {
        translationFiles.forEach(file => {
            const language = file.replace(/i18n_module_|.properties/g, '')

            if (
                !languagesToTransform.length ||
                languagesToTransform.indexOf(language) !== -1
            ) {
                try {
                    const filePathToDelete = path.join(argv.inDir, file)
                    fs.unlinkSync(filePathToDelete)
                    argv.verbose && log.debug(`Deleted old file:`)
                    argv.verbose && log.debug(`"${filePathToDelete}"`)
                } catch (e) {
                    log.error('Could not delete old translation file')
                    log.error(e.message)
                }
            }
        })
    }
}
