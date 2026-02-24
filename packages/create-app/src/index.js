const { execSync } = require('node:child_process')
const path = require('node:path')
const { reporter, exec, chalk } = require('@dhis2/cli-helpers-engine')
const { input, select } = require('@inquirer/prompts')
const fg = require('fast-glob')
const fs = require('fs-extra')
const getCommunityTemplates = require('./utils/getCommunityTemplates')
const { default: getPackageManager } = require('./utils/getPackageManager')
const { isGitTemplateSpecifier } = require('./utils/isGitTemplateSpecifier')
const resolveExternalTemplateSource = require('./utils/resolveExternalTemplateSource')
const {
    resolveTemplateSourceInput,
} = require('./utils/resolveTemplateSourceInput')

process.on('uncaughtException', (error) => {
    if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log('👋 until next time!')
    } else {
        // Rethrow unknown errors
        throw error
    }
})

const templates = {
    templateRoot: path.join(__dirname, '../templates'),
    templateWithList: path.join(
        __dirname,
        '../templates/template-ts-dataelements'
    ),

    templateWithReactRouter: path.join(
        __dirname,
        '../templates/template-ts-dataelements-react-router'
    ),
}
const builtInTemplateKeys = ['basic', 'react-router']

const commandHandler = {
    command: '*', // default command
    description: 'Initialize a new DHIS2 web application',
    builder: {
        yes: {
            description:
                'Skips interactive setup questions, using default options to create the new app (TypeScript, pnpm, basic template)',
            type: 'boolean',
            default: false,
            alias: 'y',
        },
        typescript: {
            description: 'Use TypeScript or JS',
            type: 'boolean',
            alias: ['ts', 'typeScript'],
        },
        template: {
            description:
                'Which template to use (basic, react-router, community template source, or GitHub template specifier)',
            type: 'string',
        },
        packageManager: {
            description: 'Package Manager',
            type: 'string',
            alias: ['package', 'packagemanager'],
        },
    },
}

const getBuiltInTemplateDirectory = (templateName) => {
    if (templateName === 'basic') {
        return templates.templateWithList
    }

    if (templateName === 'react-router') {
        return templates.templateWithReactRouter
    }

    return null
}

const formatUnknownTemplateError = (templateSource, communityTemplates) => {
    const communitySources = communityTemplates.map(
        (template) => template.source
    )
    const availableTemplates = [...builtInTemplateKeys, ...communitySources]
    const formattedTemplateList = availableTemplates.length
        ? availableTemplates.join(', ')
        : '(none)'

    return `Unknown template "${templateSource}". Available templates: ${formattedTemplateList}. Or use a GitHub template specifier like "owner/repo#ref" or "https://github.com/owner/repo#ref".`
}

const command = {
    command: '[app]',
    builder: (yargs) => {
        yargs.command(commandHandler)
    },
    handler: async (argv) => {
        let name = argv._[0] || argv.name
        let communityTemplates = []

        try {
            communityTemplates = getCommunityTemplates()
        } catch (error) {
            reporter.error(
                error instanceof Error ? error.message : String(error)
            )
            process.exit(1)
        }

        const useDefauls = argv.yes

        if (!name) {
            name = await input({
                type: 'input',
                name: 'name',
                message: 'What is the name of the project?',
                required: true,
            })
            reporter.log(`name of project: ${name}`)
        }

        const selectedOptions = {
            typeScript: argv.typescript ?? true,
            packageManager:
                argv.packageManager ?? getPackageManager() ?? 'pnpm',
            templateSource: argv.template ?? 'basic',
        }

        if (!useDefauls) {
            if (argv.typeScript === undefined) {
                const language = await select({
                    message: 'Select a language',
                    default: 'ts',
                    choices: [
                        { name: 'JavaScript', value: 'js' },
                        { name: 'TypeScript', value: 'ts' },
                    ],
                })

                selectedOptions.typeScript = language === 'ts'
            }

            if (argv.template === undefined) {
                const template = await select({
                    message: 'Select a template',
                    default: 'basic',
                    choices: [
                        { name: 'Basic Template', value: 'basic' },
                        {
                            name: 'Template with React Router',
                            value: 'react-router',
                        },
                        {
                            name: 'Community templates',
                            value: 'community',
                        },
                        {
                            name: 'Custom template from Git',
                            value: 'custom-git',
                        },
                    ],
                })

                if (template === 'custom-git') {
                    selectedOptions.templateSource = await input({
                        message:
                            'Enter GitHub template specifier (e.g. owner/repo#main)',
                        required: true,
                    })
                } else if (template === 'community') {
                    const communityTemplate = await select({
                        message: 'Select a community template',
                        choices: [
                            ...communityTemplates.map((communityEntry) => ({
                                name: communityEntry.displayName,
                                value: communityEntry.source,
                            })),
                            {
                                name: 'Use a Git repository',
                                value: 'custom-git',
                            },
                        ],
                    })

                    if (communityTemplate === 'custom-git') {
                        selectedOptions.templateSource = await input({
                            message:
                                'Enter GitHub template specifier (e.g. owner/repo#main)',
                            required: true,
                        })
                    } else {
                        selectedOptions.templateSource = communityTemplate
                    }
                } else {
                    selectedOptions.templateSource = template
                }
            }
        }

        reporter.info(
            `Initialising a new project using "${selectedOptions.packageManager}" as a package manager.`
        )

        if (selectedOptions.packageManager === 'yarn') {
            reporter.warn(
                'We recommend using "pnpm" as a package manager for new projects. Yarn 1 will be deprecated in future versions of the CLI.'
            )
        }
        // create the folder where the template will be generated
        let cwd = process.cwd()
        cwd = path.join(cwd, name)

        if (fs.existsSync(cwd)) {
            reporter.error(
                `The folder "${name}" already exists. Please either delete it, or choose a different name.`
            )
            process.exit(1)
        }

        reporter.info(`${chalk.cyan('Selected options:')}`)
        for (const [x, y] of Object.entries(selectedOptions)) {
            reporter.info(`    ${x}: ${y}`)
        }

        try {
            // Running git clean on templates folder
            // This is  useful in local development if you have built the templates for testing
            // and want to make sure to delete d2 and node_modules folders before copying the template
            execSync(`git clean -X -f -- ${templates.templateRoot}`, {
                stdio: 'ignore',
            })
            reporter.debug('Successfully ran git clean')
        } catch (err) {
            reporter.debug(err instanceof Error ? err.message : String(err))
        }

        reporter.info('Copying template files')
        let resolvedExternalTemplate
        try {
            const normalizedTemplateSource = String(
                selectedOptions.templateSource || ''
            ).trim()
            const builtInTemplatePath = getBuiltInTemplateDirectory(
                normalizedTemplateSource
            )

            if (builtInTemplatePath) {
                fs.copySync(builtInTemplatePath, cwd)
            } else {
                const resolvedTemplateSource = resolveTemplateSourceInput(
                    normalizedTemplateSource,
                    communityTemplates
                )
                const externalTemplateSource = resolvedTemplateSource.source

                if (!isGitTemplateSpecifier(externalTemplateSource)) {
                    if (resolvedTemplateSource.kind === 'community') {
                        throw new Error(
                            `Community template "${resolvedTemplateSource.name}" has an invalid source "${externalTemplateSource}".`
                        )
                    }

                    throw new Error(
                        formatUnknownTemplateError(
                            normalizedTemplateSource,
                            communityTemplates
                        )
                    )
                }

                resolvedExternalTemplate = await resolveExternalTemplateSource(
                    externalTemplateSource
                )
                fs.copySync(resolvedExternalTemplate.templatePath, cwd)
            }
        } catch (error) {
            reporter.error(
                error instanceof Error ? error.message : String(error)
            )
            process.exit(1)
        } finally {
            if (resolvedExternalTemplate) {
                await resolvedExternalTemplate.cleanup()
            }
        }

        const paths = {
            base: cwd,
            package: path.join(cwd, 'package.json'),
            config: path.join(cwd, 'd2.config.js'),
            pnpmLock: path.join(cwd, 'pnpm-lock.yaml'),
            pnpmWorkspace: path.join(cwd, 'pnpm-workspace.yaml'),
            appRootFile: path.join(cwd, 'src/App.tsx'),
            appRootWrapperFile: path.join(cwd, 'src/AppWrapper.tsx'),
            initYarnLock: path.join(__dirname, '../templates/yarn.lock'),
            initNpmLock: path.join(__dirname, '../templates/package-lock.json'),
            initGitIgnore: path.join(__dirname, '../templates/gitignore'),
        }

        // .gitignore file seems to be removed from the published npm package, so copying it separately here
        fs.copyFileSync(paths.initGitIgnore, path.join(cwd, '.gitignore'))

        const pnpm = selectedOptions.packageManager === 'pnpm'
        const npm = selectedOptions.packageManager === 'npm'
        const yarn = selectedOptions.packageManager === 'yarn'
        const pkgManager = selectedOptions.packageManager
        const typeScript = selectedOptions.typeScript

        // Default template is with PNPM with TypeScript - some modifications here for yarn/npm/JS
        const templateModifications = [
            [paths.package, true, (f) => f.replace('{{template-name}}', name)],
            [
                paths.appRootWrapperFile,
                true,
                (f) => f.replace('{{template-name}}', name),
            ],

            // [
            //     path.join(paths.base, '.husky/pre-commit'),
            //     !pnpm,
            //     (f) => f.replace(/pnpm/gm, pkgManager),
            // ],
            [
                paths.package,
                yarn,
                (f) => f.replace(/"pnpm@.+"/gm, '"yarn@1.22.22"'),
            ],
            [
                paths.package,
                npm,
                (f) => f.replace(/"pnpm@.+"/gm, '"npm@10.8.2"'),
            ],
            [paths.package, !pnpm, (f) => f.replace(/pnpm/gm, pkgManager)],
            [paths.config, !typeScript, (f) => f.replace(/\.tsx/gm, '.jsx')],
            [
                paths.appRootFile,
                !typeScript,
                (f) => f.replace(/with TypeScript/gm, 'with JavaScript'),
            ],
        ]
        templateModifications.forEach(([filePath, condition, replaceFunc]) => {
            const fileExists = fs.existsSync(filePath)

            if (!condition || !fileExists) {
                if (!fileExists) {
                    reporter.debug(
                        `File "${filePath}" specified in the template does not exist. This is likely a problem with the CLI and should be reported to the core team.`
                    )
                }
                return
            }
            let fileContent = fs.readFileSync(filePath, {
                encoding: 'utf8',
            })

            fileContent = replaceFunc(fileContent)

            fs.writeFileSync(filePath, fileContent)
        })

        // copy correct lock file for npm/yarn
        if (!pnpm) {
            // ? copying yarn.lock or package-lock speeds installation a bit
            // ? but we could also just run "yarn install" and generate the lock file
            if (fs.existsSync(paths.pnpmLock)) {
                fs.removeSync(paths.pnpmLock)
            }
            if (fs.existsSync(paths.pnpmWorkspace)) {
                fs.removeSync(paths.pnpmWorkspace)
            }

            if (npm) {
                fs.copyFileSync(
                    paths.initNpmLock,
                    path.join(paths.base, 'package-lock.json')
                )
            } else {
                fs.copyFileSync(
                    paths.initYarnLock,
                    path.join(paths.base, 'yarn.lock')
                )
            }
        }

        // convert to JS
        if (!typeScript) {
            reporter.info('Preparing JavaScript template')
            reporter.info(`    Running '${pkgManager} install'`)

            await exec({
                cmd: pkgManager,
                args: ['install'],
                cwd: paths.base,
            })
            reporter.info('    Converting template to JS with tsc')
            await exec({
                cmd: 'npx',
                args: [
                    'tsc',
                    // 'node_modules/.bin/tsc',
                    '--project',
                    path.join(paths.base, 'tsconfig.json'),
                    '--noEmit',
                    false,
                    '--jsx',
                    'preserve',
                ],

                cwd: paths.base,
                pipe: argv.debug,
            })

            reporter.debug('    Deleting TS files')
            const filePathsToRemove = path.join(paths.base, '/src/**/*.ts[x]')
            const filesToRemove = await fg.glob(filePathsToRemove)

            filesToRemove.forEach((file) => {
                fs.removeSync(file)
            })

            if (fs.existsSync(path.join(paths.base, 'types'))) {
                fs.removeSync(path.join(paths.base, 'types'))
            }

            if (fs.existsSync(path.join(paths.base, 'tsconfig.json'))) {
                fs.removeSync(path.join(paths.base, 'tsconfig.json'))
            }

            reporter.info('Finished preparing JavaScript template')
        }

        reporter.info(`Running '${pkgManager} install'`)

        await exec({
            cmd: pkgManager,
            args: ['install'],
            cwd: paths.base,
            pipe: argv.debug,
        })

        // ToDo: setup the formatting on CLI project properly and avoid running it on scaffolding
        reporter.debug(`Running '${pkgManager} format' (prettier)`)
        await exec({
            cmd: pkgManager,
            args: npm ? ['run', 'format'] : ['format'],
            cwd: paths.base,
            pipe: argv.debug,
        })

        reporter.info(`${chalk.greenBright('Done!')}`)

        const cdCmd = name != '.' ? `cd ${name} && ` : ''
        reporter.print(
            `Run ${chalk.bold(
                `${cdCmd}${pkgManager} start`
            )} to launch your new DHIS2 application`
        )

        reporter.print(
            `${chalk.gray(
                `You can also run the web application with ${chalk.bold(
                    `${pkgManager} start --proxy https://YOUR_DHIS2_INSTANCE_URL`
                )} to create a proxy on localhost to a remote DHIS2 instance. Check https://developers.dhis2.org/docs/quickstart/quickstart-web#connecting-your-web-app-to-dhis2 for more information.`
            )}`
        )

        return
    },
}

module.exports = command
