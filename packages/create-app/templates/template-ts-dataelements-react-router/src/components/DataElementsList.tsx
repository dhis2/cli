import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import {
    Center,
    CircularLoader,
    DataTable,
    DataTableCell,
    DataTableColumnHeader,
    DataTableRow,
    NoticeBox,
    TableBody,
    TableHead,
} from '@dhis2/ui'
import * as React from 'react'
import classes from './DataElementsList.module.css'
interface QueryResults {
    dataElements: Array<{
        id: string
        name: string
        displayName: string
        domainType: string
        valueType: string
        createdBy: {
            id: string
            name: string
        }
    }>
}

/**
 * Documentation for the API: https://docs.dhis2.org/en/develop/using-the-api/dhis-core-version-master/metadata.html
 * Documentation for useDataQuery hook: https://developers.dhis2.org/docs/tutorials/app-runtime-query/
 * UI Library: https://developers.dhis2.org/docs/ui/webcomponents
 */
const PAGE_SIZE = 25
const query = {
    dataElements: {
        resource: 'dataElements',
        params: {
            pageSize: PAGE_SIZE,
            fields: [
                'id,name,displayName,domainType,valueType,categoryCombo[id,name],createdBy',
            ],
            order: 'created:desc',
        },
    },
}
const DataElementsList = () => {
    const { error, loading, data } = useDataQuery<{
        dataElements: QueryResults
    }>(query)

    if (error) {
        return (
            <NoticeBox error title={i18n.t('Error')}>
                {i18n.t('Error loading the data elements')}
            </NoticeBox>
        )
    }

    return (
        <div>
            <h2>{i18n.t('Last {{n}} Data Elements:', { n: PAGE_SIZE })}</h2>
            <div className={classes.tableContainer}>
                <DataTable>
                    <TableHead>
                        <DataTableRow>
                            <DataTableColumnHeader large>
                                {i18n.t('ID')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader large>
                                {i18n.t('Name')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader large>
                                {i18n.t('Domain')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader
                                width="180px"
                                align="center"
                                large
                            >
                                {i18n.t('Value Type')}
                            </DataTableColumnHeader>
                            <DataTableColumnHeader large>
                                {i18n.t('Created by')}{' '}
                            </DataTableColumnHeader>
                        </DataTableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <DataTableRow>
                                <DataTableCell colSpan="100%">
                                    <Center>
                                        <CircularLoader large />
                                    </Center>
                                </DataTableCell>
                            </DataTableRow>
                        )}
                        {data?.dataElements?.dataElements?.map(
                            (dataElement) => {
                                return (
                                    <DataTableRow key={dataElement.id}>
                                        <DataTableCell large>
                                            {dataElement.id}
                                        </DataTableCell>
                                        <DataTableCell large>
                                            {dataElement.displayName}
                                        </DataTableCell>
                                        <DataTableCell large>
                                            {dataElement.domainType}
                                        </DataTableCell>
                                        <DataTableCell large>
                                            {dataElement.valueType?.replaceAll(
                                                '_',
                                                ' '
                                            )}
                                        </DataTableCell>
                                        <DataTableCell large>
                                            {dataElement.createdBy.name}
                                        </DataTableCell>
                                    </DataTableRow>
                                )
                            }
                        )}
                    </TableBody>
                </DataTable>
            </div>
        </div>
    )
}

export default DataElementsList
