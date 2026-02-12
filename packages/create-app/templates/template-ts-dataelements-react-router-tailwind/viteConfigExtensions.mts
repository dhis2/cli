import path from 'node:path'
import { defineConfig, ConfigEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const viteConfig = defineConfig(async (configEnv: ConfigEnv) => {
    const { mode } = configEnv
    return {
        // In dev environments, don't clear the terminal after files update
        clearScreen: mode !== 'development',
        plugins: [tailwindcss()],
        // Use an import alias: import from '@/' anywhere instead of 'src/'
        resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
        // ...other config options here
    }
})

export default viteConfig
