const resolveTemplateSourceInput = (
    templateSource,
    communityTemplates = []
) => {
    const normalizedTemplateSource = String(templateSource || '').trim()

    const matchedCommunityTemplate = communityTemplates.find(
        (communityTemplate) =>
            communityTemplate.source === normalizedTemplateSource
    )
    if (matchedCommunityTemplate) {
        return {
            kind: 'community',
            name: matchedCommunityTemplate.name,
            source: matchedCommunityTemplate.source,
        }
    }

    return {
        kind: 'external',
        source: normalizedTemplateSource,
    }
}

module.exports = {
    resolveTemplateSourceInput,
}
