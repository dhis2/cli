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

const addPootlePath = (pootlePath, template) => {
    if (!pootlePath) {
        return template.replace(/"X-Pootle.*"\n/g, '')
    }

    return template.replace('###POOTLE_PATH###', pootlePath)
}

const getTemplateAlternativeLanguage = (language, creationDate, pootlePath) => {
    const template = fs.readFileSync(
        path.join(__dirname, 'alternative_language.template'),
        { encoding: 'utf8' }
    )

    const withRequiredInfo = template
        .replace('###LANGUAGE###', language)
        .replace('###CREATION_DATE###', creationDate)
        .replace('###REVISION_DATE###', creationDate)

    const withPootlePath = addPootlePath(pootlePath, withRequiredInfo)

    return withPootlePath
}

module.exports = {
    getTemplateMainLanguage,
    getTemplateAlternativeLanguage,
}
