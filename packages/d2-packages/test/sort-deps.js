/** @format */

const test = require('tape')

const { sort } = require('../lib/deps.js')
const deps = [
    {
        name: '@dhis2/d2-ui-app',
        dependents: ['@dhis2/d2-ui-header-bar'],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/app',
    },
    {
        name: '@dhis2/d2-ui-core',
        dependents: [
            '@dhis2/d2-ui-app',
            '@dhis2/d2-ui-expression-manager',
            '@dhis2/d2-ui-forms',
            '@dhis2/d2-ui-group-editor',
            '@dhis2/d2-ui-header-bar',
            '@dhis2/d2-ui-icon-picker',
            '@dhis2/d2-ui-interpretations',
            '@dhis2/d2-ui-legend',
            '@dhis2/d2-ui-org-unit-select',
            '@dhis2/d2-ui-org-unit-tree',
            '@dhis2/d2-ui-sharing-dialog',
            '@dhis2/d2-ui-table',
            '@dhis2/d2-ui-translation-dialog',
        ],
        depends: [],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/core',
    },
    {
        name: '@dhis2/d2-ui-expression-manager',
        dependents: [],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/expression-manager',
    },
    {
        name: '@dhis2/d2-ui-favorites-dialog',
        dependents: ['@dhis2/d2-ui-favorites-menu', '@dhis2/d2-ui-file-menu'],
        depends: ['@dhis2/d2-ui-sharing-dialog'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/favorites-dialog',
    },
    {
        name: '@dhis2/d2-ui-favorites-menu',
        dependents: [],
        depends: [
            '@dhis2/d2-ui-favorites-dialog',
            '@dhis2/d2-ui-sharing-dialog',
            '@dhis2/d2-ui-translation-dialog',
        ],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/favorites-menu',
    },
    {
        name: '@dhis2/d2-ui-file-menu',
        dependents: [],
        depends: [
            '@dhis2/d2-ui-favorites-dialog',
            '@dhis2/d2-ui-sharing-dialog',
            '@dhis2/d2-ui-translation-dialog',
        ],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/file-menu',
    },
    {
        name: '@dhis2/d2-ui-forms',
        dependents: ['@dhis2/d2-ui-legend'],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/forms',
    },
    {
        name: '@dhis2/d2-ui-formula-editor',
        dependents: [],
        depends: [],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/formula-editor',
    },
    {
        name: '@dhis2/d2-ui-group-editor',
        dependents: [],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/group-editor',
    },
    {
        name: '@dhis2/d2-ui-header-bar',
        dependents: [],
        depends: ['@dhis2/d2-ui-app', '@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/header-bar',
    },
    {
        name: '@dhis2/d2-ui-icon-picker',
        dependents: [],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/icon-picker',
    },
    {
        name: '@dhis2/d2-ui-interpretations',
        dependents: [],
        depends: [
            '@dhis2/d2-ui-core',
            '@dhis2/d2-ui-mentions-wrapper',
            '@dhis2/d2-ui-sharing-dialog',
        ],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/interpretations',
    },
    {
        name: '@dhis2/d2-ui-legend',
        dependents: [],
        depends: [
            '@dhis2/d2-ui-core',
            '@dhis2/d2-ui-forms',
            '@dhis2/d2-ui-table',
        ],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/legend',
    },
    {
        name: '@dhis2/d2-ui-mentions-wrapper',
        dependents: ['@dhis2/d2-ui-interpretations'],
        depends: [],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/mentions-wrapper',
    },
    {
        name: '@dhis2/d2-ui-org-unit-select',
        dependents: [],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/org-unit-select',
    },
    {
        name: '@dhis2/d2-ui-org-unit-tree',
        dependents: [],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/org-unit-tree',
    },
    {
        name: '@dhis2/d2-ui-rich-text',
        dependents: [],
        depends: [],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/rich-text',
    },
    {
        name: '@dhis2/d2-ui-sharing-dialog',
        dependents: [
            '@dhis2/d2-ui-favorites-dialog',
            '@dhis2/d2-ui-favorites-menu',
            '@dhis2/d2-ui-file-menu',
            '@dhis2/d2-ui-interpretations',
        ],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/sharing-dialog',
    },
    {
        name: '@dhis2/d2-ui-table',
        dependents: ['@dhis2/d2-ui-legend'],
        depends: ['@dhis2/d2-ui-core', '@dhis2/d2-ui-translation-dialog'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/table',
    },
    {
        name: '@dhis2/d2-ui-translation-dialog',
        dependents: [
            '@dhis2/d2-ui-favorites-menu',
            '@dhis2/d2-ui-file-menu',
            '@dhis2/d2-ui-table',
        ],
        depends: ['@dhis2/d2-ui-core'],
        path: '/home/varl/dev/dhis2/libs/d2-ui/packages/translation-dialog',
    },
]

test('sort build order for d2-ui dep graph', t => {
    t.plan(20)

    const graph = sort(deps)

    t.equals(graph[0].name, '@dhis2/d2-ui-core', 'core: has no dependencies')
    t.equals(
        graph[1].name,
        '@dhis2/d2-ui-expression-manager',
        'expression manager: depends on core'
    )
    t.equals(graph[2].name, '@dhis2/d2-ui-forms', 'forms: depends on core')
    t.equals(
        graph[3].name,
        '@dhis2/d2-ui-formula-editor',
        'formula editor: no dependencies'
    )
    t.equals(
        graph[4].name,
        '@dhis2/d2-ui-group-editor',
        'group editor: depends on core'
    )
    t.equals(
        graph[5].name,
        '@dhis2/d2-ui-icon-picker',
        'icon picker: depends on core'
    )
    t.equals(
        graph[6].name,
        '@dhis2/d2-ui-mentions-wrapper',
        'mentions wrapper: has no dependencies'
    )
    t.equals(
        graph[7].name,
        '@dhis2/d2-ui-org-unit-select',
        'org unit select: depends on core'
    )
    t.equals(
        graph[8].name,
        '@dhis2/d2-ui-org-unit-tree',
        'org unit tree: depends on core'
    )
    t.equals(
        graph[9].name,
        '@dhis2/d2-ui-rich-text',
        'rich text: has no dependencies'
    )
    t.equals(
        graph[10].name,
        '@dhis2/d2-ui-sharing-dialog',
        'sharing dialog: depends on core'
    )
    t.equals(
        graph[11].name,
        '@dhis2/d2-ui-translation-dialog',
        'translation dialog: depends on core'
    )
    t.equals(graph[12].name, '@dhis2/d2-ui-app', 'app: depends on core')
    t.equals(
        graph[13].name,
        '@dhis2/d2-ui-favorites-dialog',
        'favorites dialog: depends on sharing dialog'
    )
    t.equals(
        graph[14].name,
        '@dhis2/d2-ui-favorites-menu',
        'favorites menu: depends on favorites dialog, sharing dialog, translation dialog'
    )
    t.equals(
        graph[15].name,
        '@dhis2/d2-ui-file-menu',
        'file menu: depends on favorites dialog, sharing dialog, translation dialog'
    )
    t.equals(
        graph[16].name,
        '@dhis2/d2-ui-header-bar',
        'header bar: depends on app and core'
    )
    t.equals(
        graph[17].name,
        '@dhis2/d2-ui-interpretations',
        'interpretations: depends on core, mentions wrapper, sharing dialog'
    )
    t.equals(
        graph[18].name,
        '@dhis2/d2-ui-table',
        'table: depends on core and translation dialog'
    )
    t.equals(
        graph[19].name,
        '@dhis2/d2-ui-legend',
        'legend: depends on core, forms, table'
    )
})

test('sort dep graph with no interdeps', t => {
    t.plan(3)

    const sdeps = [
        {
            name: 'a',
            depends: [],
        },
        {
            name: 'b',
            depends: [],
        },
        {
            name: 'c',
            depends: [],
        },
    ]
    const graph = sort(sdeps)

    t.equals(graph[0].name, 'a')
    t.equals(graph[1].name, 'b')
    t.equals(graph[2].name, 'c')
})

test('sort simple dep graph with interdeps', t => {
    t.plan(3)

    const sdeps = [
        {
            name: 'a',
            depends: ['c'],
        },
        {
            name: 'b',
            depends: ['a'],
        },
        {
            name: 'c',
            depends: [],
        },
    ]
    const graph = sort(sdeps)

    t.equals(graph[0].name, 'c')
    t.equals(graph[1].name, 'a')
    t.equals(graph[2].name, 'b')
})
