const jsondiffpatch = require('jsondiffpatch')

const HtmlFormatter = jsondiffpatch.formatters.html.default

// See https://github.com/benjamine/jsondiffpatch/blob/master/src/formatters/html.js
// for more context
class SchemaHtmlFormatter extends HtmlFormatter {
    // Extended to add link and IDs for each outer object-property
    // https://github.com/benjamine/jsondiffpatch/blob/master/src/formatters/html.js#L62
    // eslint-disable-next-line max-params
    nodeBegin(context, key, leftKey, type, nodeType) {
        const nodeClass = `jsondiffpatch-${type}${
            nodeType ? ` jsondiffpatch-child-node-type-${nodeType}` : ''
        }`
        let objectHeader = leftKey
        let idString = ''
        if ((type === 'node' && nodeType === 'object') || !nodeType) {
            idString = `id="${leftKey}"`
            objectHeader = `<a href="#${leftKey}">${leftKey}</a>`
        }
        context.out(
            `<li class="${nodeClass}" data-key="${leftKey}">` +
                `<div class="jsondiffpatch-property-name" ${idString}>${objectHeader}</div>`
        )
    }
}

let defaultInstance
function format(delta, left) {
    if (!defaultInstance) {
        defaultInstance = new SchemaHtmlFormatter()
    }
    return defaultInstance.format(delta, left)
}

module.exports = {
    SchemaHtmlFormatter,
    format,
}
