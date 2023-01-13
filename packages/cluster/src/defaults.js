module.exports = {
    dhis2Home: '/opt/dhis2',
    dhis2Version: '',
    dbVersion: '',
    channel: 'stable',
    image: 'dhis2/core{channel}:{version}',
    port: 8080,
    customContext: false,
    update: false,
    seed: false,
    dockerComposeDirectory: 'cluster',
    dockerComposeRepository:
        'https://github.com/dhis2/docker-compose/archive/master.tar.gz',
    demoDatabaseURL:
        'https://databases.dhis2.org/sierra-leone/{version}/dhis2-db-sierra-leone.sql.gz',
}
