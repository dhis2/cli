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
const { log, namespace } = require('@dhis2/cli-helpers-engine')

const {
    checkRequirements,
} = require('./transform_translate/checkRequirements.js')
const {
    deleteLegacyFiles,
} = require('./transform_translate/deleteLegacyFiles.js')
const {
    generateTranslationMappings,
} = require('./transform_translate/generateTranslationMappings.js')
const {
    createNewTranslationFiles,
} = require('./transform_translate/createNewTranslationFiles.js')

const CONSUMING_ROOT = path.join(process.cwd())
const TRANSLATION_IN_DIR = path.join(CONSUMING_ROOT, 'src/i18n')
const TRANSLATION_OUT_DIR = path.join(CONSUMING_ROOT, 'i18n')
const CREATION_DATE = new Date().toISOString()

const fileIsOldTranslationFile = fileName => fileName.match(/\.properties$/)

const command = 'transform_translate'
const describe = 'Transform old translation file style to new style'
const builder = {
    appName: {
        describe:
            'The name of the app, must be lower case, use dashes instead of whitespaces and be postfixed with "-app". Normally this should the url part of the github repo (maintenance app => "maintenance-app")',
        type: 'string',
        required: true,
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

    overrideExistingFiles: {
        describe: 'Overriding the contents of existing translation files',
        type: 'boolean',
    },

    appendToExistingFiles: {
        describe:
            'Appends the new contents to existing translation files, can only be used when not using `--override-existing-files`',
        type: 'boolean',
        conflicts: 'overrideExistingFiles',
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

const handler = ({
    inDir,
    outDir,
    appName,
    languages,
    deleteOldFiles,
    logMissingKeys,
    primaryLanguage,
    overrideExistingFiles,
    appendToExistingFiles,
}) => {
    const languagesToTransform = languages ? languages.split(/,\s*/) : []

    const translationFiles = fs
        .readdirSync(inDir)
        .filter(fileIsOldTranslationFile)

    log.info('Checking requirements')
    checkRequirements({
        inDir,
        outDir,
        appName,
        primaryLanguage,
        translationFiles,
    })

    log.info('Extracting key/value pairs from translation files')
    const translations = generateTranslationMappings({
        inDir,
        primaryLanguage: primaryLanguage,
        languagesToTransform,
        translationFiles,
    })

    log.info('Creating new translation files')
    createNewTranslationFiles({
        outDir,
        appName,
        translations,
        CREATION_DATE,
        logMissingKeys,
        primaryLanguage,
        languagesToTransform,
        overrideExistingFiles,
        appendToExistingFiles,
    })

    if (deleteOldFiles) {
        log.info('Deleting legacy files')
        deleteLegacyFiles({
            translationFiles,
            languagesToTransform,
        })
    }
}

module.exports = namespace('i18n', {
    command,
    describe,
    builder,
    handler,
})
