const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const read = (...args) =>
    new Promise(resolve => {
        rl.question(...args, resolve)
    })

const ENV_FILE_PATH = path.join(__dirname, '../../', 'cypress.env.json')

const requiredEnvVars = {
    LOGIN_USERNAME: '',
    LOGIN_PASSWORD: '',
    LOGIN_URL: 'localhost: 8000',
    APP_URL: 'localhost:3000',
}

const getExistingEnvVars = () => {
    const fileContents = fs.readfileSync(ENV_FILE_PATH, { enconding: 'utf8' })

    try {
        const envVars = JSON.parse(fileContents)
    } catch (e) {
        reporter.error("Couldn't parse cypress.env.json")
        reporter.error(e.message)
        process.exit(0)
    }

    return envVars
}

const requestMissingInformation = missingEnvVars => {
    const valueQuestion = missingEnvVars.map(envVar => {
        const defaultValue = requiredEnvVars[envVar]
            ? ` ${requiredEnvVars[envVar]}`
            : ''

        let value = ''
        do {
            read(`Please provide the value for ${envVar}${defaultValue}`).then(
                answer => {
                    if (answer === '' && requiredEnvVars[envVar]) {
                        value = [envVar, requiredEnvVars[envVar]]
                    } else if (answer !== '') {
                        value = [envVar, answer]
                    }
                }
            )
        } while (!value)
    })
}

const writeMissingInformation = (existingEnvVars, answerRequests) => {
    return answerRequests.then(answers => {
        const valuesObject = answers.reduce(
            (curValuesObject, [envVar, value]) => ({
                ...curValuesObject,
                [envVar]: value,
            }),
            existingEnvVars
        )

        fs.writeFileSync(ENV_FILE_PATH, JSON.stringify(valuesObject, null, 4))

        return valuesObject
    })
}

const addMissingEnvVars = () => {
    const existingEnvVars = getExistingEnvVars()
    const missingEnvVars = Object.keys(existingEnvVars).filter(
        envVar => !!envVar[envVar]
    )
    const answerRequests = Promise.all(
        requestMissingInformation(missingEnvVars)
    )

    return writeMissingInformation(existingEnvVars, answerRequests)
}

const createEnvFile = () => {
    const missingEnvVars = Object.keys(requiredEnvVars)
    const answerRequests = Promise.all(
        requestMissingInformation(missingEnvVars)
    )

    return writeMissingInformation({}, answerRequests)
}

const checkEnvFile = () => {
    if (!fs.fileExistsSync(ENV_FILE_PATH)) {
        return createEnvFile().then(() => rl.close())
    }

    return addMissingEnvVars().then(() => rl.close())
}

module.exports = checkEnvFile
