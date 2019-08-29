const fs = require('fs')
const path = require('path')

const getTemplateMainLanguage = creationDate => {
    const template = fs.readFileSync(
        path.join(__dirname, 'main_language.template'),
        { encoding: 'utf8' }
    )

    return template
        .replace('###CREATION_DATE###', creationDate)
        .replace('###REVISION_DATE###', creationDate)
}

const getTemplateAlternativeLanguage = (appName, language, creationDate) => {
    const template = fs.readFileSync(
        path.join(__dirname, 'alternative_language.template'),
        { encoding: 'utf8' }
    )

    return template
        .replace('###APP_NAME###', appName)
        .replace('###LANGUAGE###', language)
        .replace('###CREATION_DATE###', creationDate)
        .replace('###REVISION_DATE###', creationDate)
}

module.exports = {
    getTemplateMainLanguage,
    getTemplateAlternativeLanguage,
}
