const SemanticReleaseError = require('@semantic-release/error')

const analyzeCommits = (config, context) => {
    const { logger, commits } = context

    if (commits.length === 0) {
        throw new SemanticReleaseError(
            'No commits to analyze',
            'ENOCOMMITS',
            'At least one commit needs to be passed to semantic-release-defer-release'
        )
    }

    const { message, commit } = commits[0]
    const defer = /\[defer[ -]release\]/gi

    if (message.match(defer)) {
        logger.warn(`This release has been deferred by commit ${commit.short}`)
        logger.complete('Halting release process...')
        process.exit(0)
    }
}

module.exports = { analyzeCommits }
