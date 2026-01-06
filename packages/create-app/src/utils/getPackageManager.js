const getPackageManager = () => {
    const userAgent = process.env.npm_config_user_agent || ''

    if (userAgent.startsWith('yarn')) {
        return 'yarn'
    }

    if (userAgent.startsWith('npm')) {
        return 'npm'
    }

    return 'pnpm'
}

export default getPackageManager
