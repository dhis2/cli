const SemanticReleaseError = require('@semantic-release/error')

const analyzeCommits = (config = {}, context) => {
    const { logger, commits } = context

    const { message, commit } = commits[0]
    const defer = /\[defer release\]/gi

    if (message.match(defer)) {
        throw new SemanticReleaseError(
            'Defer the release',
            'EDEFERRELEASE',
            `This release has been deferred by commit ${commit.short}`
        )
    }
}

module.exports = { analyzeCommits }
