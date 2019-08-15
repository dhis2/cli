const fs = require('fs')

/**
 * @param {Object} args
 * @param {string[]} args.translationFiles
 * @param {string[]} args.languagesToTransform
 * @param {string} args.primaryLanguage
 * @return {Object}
 */
const generateTranslationMappings = ({
    translationFiles,
    languagesToTransform,
    primaryLanguage,
}) =>
    translationFiles.reduce((mappings, file) => {
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

module.exports = {
    generateTranslationMappings,
}
