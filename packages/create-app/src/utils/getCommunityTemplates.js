const path = require('node:path')
const fs = require('fs-extra')
const yaml = require('yaml')

const defaultRegistryPath = path.join(__dirname, '../community-templates.yaml')

const getRequiredString = (value, fieldPath, registryPath) => {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(
            `Invalid community template registry "${registryPath}": "${fieldPath}" must be a non-empty string.`
        )
    }

    return value.trim()
}

const getOptionalString = (value, fieldPath, registryPath) => {
    if (value === undefined || value === null) {
        return null
    }

    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(
            `Invalid community template registry "${registryPath}": "${fieldPath}" must be a non-empty string when provided.`
        )
    }

    return value.trim()
}

const getOptionalPersonMetadata = (value, fieldPath, registryPath) => {
    if (value === undefined || value === null) {
        return null
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(
            `Invalid community template registry "${registryPath}": "${fieldPath}" must be an object when provided.`
        )
    }

    const name = getOptionalString(
        value.name,
        `${fieldPath}.name`,
        registryPath
    )
    const url = getOptionalString(value.url, `${fieldPath}.url`, registryPath)

    if (!name && !url) {
        return null
    }

    return {
        ...(name ? { name } : {}),
        ...(url ? { url } : {}),
    }
}

const getCommunityTemplates = (registryPath = defaultRegistryPath) => {
    let registryFileContent

    try {
        registryFileContent = fs.readFileSync(registryPath, 'utf8')
    } catch (error) {
        const detail =
            error instanceof Error && error.message ? ` ${error.message}` : ''
        throw new Error(
            `Failed to read community template registry "${registryPath}".${detail}`
        )
    }

    let parsedRegistry
    try {
        parsedRegistry = yaml.parse(registryFileContent)
    } catch (error) {
        const detail =
            error instanceof Error && error.message ? ` ${error.message}` : ''
        throw new Error(
            `Failed to parse community template registry "${registryPath}".${detail}`
        )
    }

    if (!parsedRegistry || !Array.isArray(parsedRegistry.templates)) {
        throw new Error(
            `Invalid community template registry "${registryPath}": "templates" must be an array.`
        )
    }

    const knownTemplateSources = new Set()

    return parsedRegistry.templates.map((template, index) => {
        const templateFieldPrefix = `templates[${index}]`
        if (
            !template ||
            typeof template !== 'object' ||
            Array.isArray(template)
        ) {
            throw new Error(
                `Invalid community template registry "${registryPath}": "${templateFieldPrefix}" must be an object.`
            )
        }

        const name = getRequiredString(
            template.name,
            `${templateFieldPrefix}.name`,
            registryPath
        )
        const source = getRequiredString(
            template.source,
            `${templateFieldPrefix}.source`,
            registryPath
        )

        if (knownTemplateSources.has(source)) {
            throw new Error(
                `Invalid community template registry "${registryPath}": duplicate template source "${source}" in "${templateFieldPrefix}.source".`
            )
        }
        knownTemplateSources.add(source)

        const description = getOptionalString(
            template.description,
            `${templateFieldPrefix}.description`,
            registryPath
        )
        const maintainer = getOptionalPersonMetadata(
            template.maintainer,
            `${templateFieldPrefix}.maintainer`,
            registryPath
        )
        const organisation = getOptionalPersonMetadata(
            template.organisation,
            `${templateFieldPrefix}.organisation`,
            registryPath
        )

        const attributionParts = []
        if (maintainer?.name) {
            attributionParts.push(`by ${maintainer.name}`)
        }
        if (organisation?.name) {
            attributionParts.push(`org: ${organisation.name}`)
        }
        const displayName = attributionParts.length
            ? `${name} (${attributionParts.join(', ')})`
            : name

        return {
            name,
            source,
            ...(description ? { description } : {}),
            ...(maintainer ? { maintainer } : {}),
            ...(organisation ? { organisation } : {}),
            displayName,
        }
    })
}

module.exports = getCommunityTemplates
