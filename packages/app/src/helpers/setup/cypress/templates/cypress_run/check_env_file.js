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

const DEFAULT_ENV_FILE_PATH = path.join(__dirname, '../../', 'cypress.env.json')

const REQUIRED_ENV_VARS = {
    LOGIN_USERNAME: '',
    LOGIN_PASSWORD: '',
    LOGIN_URL: 'localhost:8000',
    APP_URL: 'localhost:3000',
}

const getExistingEnvVars = envFilePath => {
    const fileContents = fs.readFileSync(envFilePath, { enconding: 'utf8' })
    let envVars = {}

    try {
        envVars = JSON.parse(fileContents)
    } catch (e) {
        console.error("Couldn't parse cypress.env.json")
        console.error(e.message)
        process.exit(1)
    }

    return envVars
}

const requestInformationForEnvVar = ({ resolve, defaultValue, envVar }) => {
    read(`Please provide the value for ${envVar}${defaultValue}\n`).then(
        answer => {
            if (answer === '' && REQUIRED_ENV_VARS[envVar]) {
                resolve([envVar, REQUIRED_ENV_VARS[envVar]])
            } else if (answer !== '') {
                resolve([envVar, answer])
            } else {
                requestInformationForEnvVar({ resolve, defaultValue, envVar })
            }
        }
    )
}

const requestMissingInformation = missingEnvVars => {
    return missingEnvVars.reduce((process, envVar) => {
        return process.then(answers => {
            const defaultValue = REQUIRED_ENV_VARS[envVar]
                ? ` (${REQUIRED_ENV_VARS[envVar]})`
                : ''

            return new Promise(resolve => {
                const customResolve = answer => resolve([...answers, answer])
                requestInformationForEnvVar({
                    resolve: customResolve,
                    defaultValue,
                    envVar,
                })
            })
        })
    }, Promise.resolve([]))
}

const writeMissingInformation = ({
    existingEnvVars,
    answerRequests,
    envFilePath,
}) => {
    return answerRequests.then(answers => {
        const valuesObject = answers.reduce(
            (curValuesObject, [envVar, value]) => ({
                ...curValuesObject,
                [envVar]: value,
            }),
            existingEnvVars
        )

        fs.writeFileSync(envFilePath, JSON.stringify(valuesObject, null, 4))

        return valuesObject
    })
}

const addMissingEnvVars = envFilePath => {
    const existingEnvVars = getExistingEnvVars(envFilePath)
    const missingEnvVars = Object.keys(REQUIRED_ENV_VARS).filter(
        envVar => !(envVar in existingEnvVars)
    )
    const answerRequests = requestMissingInformation(missingEnvVars)

    return writeMissingInformation({
        existingEnvVars,
        answerRequests,
        envFilePath,
    })
}

const createEnvFile = envFilePath => {
    const missingEnvVars = Object.keys(REQUIRED_ENV_VARS)
    const answerRequests = requestMissingInformation(missingEnvVars)

    return writeMissingInformation({
        existingEnvVars: {},
        answerRequests,
        envFilePath,
    })
}

const checkEnvFile = customEnvFilePath => {
    const envFilePath = customEnvFilePath || DEFAULT_ENV_FILE_PATH

    const job = !fs.existsSync(envFilePath)
        ? createEnvFile(envFilePath)
        : addMissingEnvVars(envFilePath)

    return job.then(() => rl.close())
}

module.exports = checkEnvFile
