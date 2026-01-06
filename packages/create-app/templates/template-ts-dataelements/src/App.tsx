import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import React, { FC } from 'react'
import classes from '@/App.module.css'
import DataElementsList from '@/components/DataElementsList'

interface QueryResults {
    me: {
        name: string
    }
}

const query = {
    me: {
        resource: 'me',
    },
}

const MyApp: FC = () => {
    const { error, loading, data } = useDataQuery<QueryResults>(query)

    if (error) {
        return <span>{i18n.t('ERROR')}</span>
    }

    if (loading) {
        return <span>{i18n.t('Loading...')}</span>
    }

    return (
        <div className={classes.container}>
            <h2>{i18n.t('Hello {{name}}', { name: data?.me?.name })}</h2>
            <h3>{i18n.t('Welcome to DHIS2 with TypeScript!')}</h3>
            <div className={classes.noticeContainer}>
                <NoticeBox title="DHIS2 Web application">
                    This application was scaffolded using DHIS2 app platform
                    (with <code>npm create @dhis2/app</code>).
                    <br />
                    For more information, you can check the DHIS2 documentation:
                    <ul>
                        <li>
                            <a
                                target="_blank"
                                href="https://developers.dhis2.org/docs/guides"
                                rel="noreferrer"
                            >
                                Web development guides
                            </a>
                        </li>
                        <li>
                            <a
                                target="_blank"
                                href="https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/metadata.html"
                                rel="noreferrer"
                            >
                                Documentation for the API{' '}
                            </a>
                        </li>
                        <li>
                            <a
                                target="_blank"
                                href="https://developers.dhis2.org/docs/tutorials/app-runtime-query/"
                                rel="noreferrer"
                            >
                                AppRuntime and useDataQuery hook
                            </a>
                        </li>
                        <li>
                            <a
                                target="_blank"
                                href="https://developers.dhis2.org/docs/ui/webcomponents"
                                rel="noreferrer"
                            >
                                UI Library
                            </a>
                        </li>
                        <li>
                            <a
                                target="_blank"
                                href="https://developers.dhis2.org/demo/"
                                rel="noreferrer"
                            >
                                UI library demo
                            </a>
                        </li>
                    </ul>
                </NoticeBox>
            </div>
            <DataElementsList />
        </div>
    )
}

export default MyApp
