const { reporter } = require('@dhis2/cli-helpers-engine')
const inquirer = require('inquirer')

const nameQuestion = {
    type: 'input',
    name: 'name',
    message: 'What is the name of the CLI module?',
}

const namespaceQuestion = {
    type: 'input',
    name: 'namespace',
    message:
        'What is the parent namespace?  (space, comma, or hyphen-separated; omit d2)',
}

const baseQuestions = [
    {
        type: 'input',
        name: 'author',
        message: 'Author name?',
        default: 'DHIS2 <info@dhis2.org>',
    },
    {
        type: 'input',
        name: 'description',
        message: 'CLI description',
        required: true,
    },
    {
        type: 'input',
        name: 'version',
        message: 'Package version',
        default: '1.0.0',
    },
]

const cliBuilder = async (argv = {}) => {
    let basename = argv.name
    if (!basename) {
        const answer = await inquirer.prompt(nameQuestion)
        basename = answer.name
    }
    if (basename.indexOf('-') !== -1) {
        reporter.error(
            'Basename cannot contain any dashes, you can specify the heirarchical namespace later'
        )
        process.exit(1)
    }

    let namespace = argv.namespace
    if (!namespace) {
        const answer = await inquirer.prompt(namespaceQuestion)
        namespace = answer.namespace
    }
    const parsedNamespace = namespace.replace(/[\s-,]/g, '-')
    const fullName = `${parsedNamespace}${
        parsedNamespace ? '-' : ''
    }${basename}`
    const executable = `d2-${fullName}`

    const answers = await inquirer.prompt(baseQuestions)

    return {
        basename,
        namespace: parsedNamespace,
        fullName,
        executable,
        ...answers,
    }
}

module.exports = cliBuilder
