const LENGTH_TO_SPLIT_LINE_AT = 77

/**
 * \u[a-zA-Z0-9] will be interpreted as unicode characters and need to be escaped.
 * The escaped sequence will look like this: %5Cu[a-zA-Z0-9]
 *
 * The translation needs to be split by whitespaces first in order to create the
 * correct structure of the new translation
 */
const splitTranslation = translation =>
    translation.split(' ').reduce((parts, curSplit) => {
        const latestPart = parts[parts.length - 1]
        const latestPartEscaped = escape(latestPart)
        const curSplitEscaped = escape(curSplit)

        if (
            parts.length > 0 &&
            latestPartEscaped.length + curSplitEscaped.length <
                LENGTH_TO_SPLIT_LINE_AT
        ) {
            parts[parts.length - 1] += ` ${curSplit}`
            return parts
        }

        if (curSplitEscaped.length < LENGTH_TO_SPLIT_LINE_AT) {
            parts.push(curSplit)
            return parts
        }

        curSplitEscaped.match(/.{1,76}(?=(%5Cu))?/g).forEach(escapedSplit => {
            parts.push(unescape(escapedSplit))
        })

        return parts
    }, [])

module.exports = {
    splitTranslation,
    LENGTH_TO_SPLIT_LINE_AT,
}
