/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',

    entryPoints: {
        app: './src/App.tsx',
    },

    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
