const fs = require('fs')

const getTemplateMainLanguage = () => {
    const template = fs.readFileSync(
        path.join(__dirname, 'main_language.template'),
        { encoding: 'utf8' }
    )

    return template
        .replace('###CREATION_DATE###', CREATION_DATE)
        .replace('###REVISION_DATE###', CREATION_DATE)
}

const getTemplateAlternativeLanguage = (appName, language) => {
    const template = fs.readFileSync(
        path.join(__dirname, 'alternative_language.template'),
        { encoding: 'utf8' }
    )

    return template
        .replace('###APP_NAME###', appName)
        .replace('###LANGUAGE###', language)
        .replace('###CREATION_DATE###', CREATION_DATE)
        .replace('###REVISION_DATE###', CREATION_DATE)
}
