const path = require('path')
const { reporter, exec } = require('@dhis2/cli-helpers-engine')
const { input, select } = require('@inquirer/prompts')
const decompress = require('decompress')
const fg = require('fast-glob')
const fs = require('fs-extra')

process.on('uncaughtException', (error) => {
    if (error instanceof Error && error.name === 'ExitPromptError') {
        console.log('👋 until next time!')
    } else {
        // Rethrow unknown errors
        throw error
    }
})

const templates = {
    templateWithList: path.join(
        __dirname,
        '../templates/template-ts-dataelements.zip'
    ),

    templateWithReactRouter: path.join(
        __dirname,
        '../templates/template-ts-dataelements-react-router.zip'
    ),
}

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
            default: true,
            alias: ['ts', 'typeScript'],
        },
        template: {
            description: 'Which template to use (Basic, With React Router)',
            type: 'string',
            default: 'basic',
        },
        packageManager: {
            description: 'Package Manager',
            type: 'string',
            default: 'pnpm',
            alias: ['package', 'packagemanager'],
        },
    },
}
const getTemplateFile = (templateName) => {
    return templateName === 'react-router'
        ? templates.templateWithReactRouter
        : templates.templateWithList
}

const defaultOptions = {
    typeScript: true,
    templateName: 'basic',
    template: getTemplateFile('basic'),
    packageManager: 'pnpm',
}

const command = {
    command: '[app]',
    builder: (yargs) => {
        yargs.command(commandHandler)
    },
    handler: async (argv) => {
        let name = argv._[0] || argv.name

        const selectedOptions = {
            ...defaultOptions,
        }

        reporter.debug(`running "npm create @dhis2/app" (or npx) command"`)
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

        selectedOptions.typeScript = argv.typescript
        selectedOptions.packageManager = argv.packageManager
        selectedOptions.templateName = argv.template
        selectedOptions.template = getTemplateFile(argv.template)

        if (!useDefauls) {
            const packageManager = await select({
                message: 'Select a package manager',
                default: 'pnpm',
                choices: [
                    { name: 'npm', value: 'npm' },
                    { name: 'pnpm', value: 'pnpm' },
                    { name: 'yarn 1 (legacy)', value: 'yarn' },
                ],
            })

            // pnpm = packageManager === 'pnpm'
            // npm = packageManager === 'npm'
            selectedOptions.packageManager = packageManager

            const language = await select({
                message: 'Select a language',
                default: 'ts',
                choices: [
                    { name: 'JavaScript', value: 'js' },
                    { name: 'TypeScript', value: 'ts' },
                ],
            })

            selectedOptions.typeScript = language === 'ts'

            const template = await select({
                message: 'Select a teamplate',
                default: 'ts',
                choices: [
                    { name: 'Basic Template', value: 'basic' },
                    {
                        name: 'Template with React Router',
                        value: 'react-router',
                    },
                ],
            })

            selectedOptions.templateName = template
            selectedOptions.template = getTemplateFile(template)
        }

        // let pkgManager = 'yarn'
        // if (pnpm) {
        //     pkgManager = 'pnpm'
        // } else if (npm) {
        //     pkgManager = 'npm'
        // }

        reporter.info(
            `Initialising a new project using "${selectedOptions.packageManager}" as a package manager.`
        )

        if (selectedOptions.packageManager !== 'pnpm') {
            reporter.warn(
                'We recommend using "pnpm" as a package manager for new projects. You can do so by passing the argument --pnpm (i.e. d2 app scripts init --pnpm). This will become the default in future versions of d2 CLI.'
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

        reporter.info(`selected options: ${JSON.stringify(selectedOptions)}`)

        await decompress(selectedOptions.template, cwd)

        const paths = {
            base: cwd,
            package: path.join(cwd, 'package.json'),
            config: path.join(cwd, 'd2.config.js'),
            pnpmLock: path.join(cwd, 'pnpm-lock.yaml'),
            pnpmWorkspace: path.join(cwd, 'pnpm-workspace.yaml'),
            appRootFile: path.join(cwd, 'src/App.tsx'),
            initYarnLock: path.join(__dirname, '../templates/yarn.lock'),
            initNpmLock: path.join(__dirname, '../templates/package-lock.json'),
        }

        const pnpm = selectedOptions.packageManager === 'pnpm'
        const npm = selectedOptions.packageManager === 'npm'
        const yarn = selectedOptions.packageManager === 'yarn'
        const pkgManager = selectedOptions.packageManager
        const typeScript = selectedOptions.typeScript

        // Default template is with PNPM with TypeScript - some modifications here for yarn/npm/JS
        const templateModifications = [
            [paths.package, true, (f) => f.replace('{{template-name}}', name)],
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
            reporter.info(` running '${pkgManager} install'`)

            await exec({
                cmd: pkgManager,
                args: ['install'],
                cwd: paths.base,
            })
            reporter.info(' convert template to JS with tsc')
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

            reporter.info(' Deleting TS files')
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

        await exec({
            cmd: pkgManager,
            args: npm ? ['run', 'format'] : ['format'],
            cwd: paths.base,
            pipe: argv.debug,
        })

        reporter.info('Done!')

        return
    },
}

module.exports = command
