module.exports = {
    dhis2Version: '',
    dbVersion: '',
    channel: 'stable',
    image: 'dhis2/core{channel}:{version}',
    port: 8080,
    customContext: false,
    update: false,
    seed: false,
    dockerComposeRepository:
        'https://github.com/dhis2/docker-compose/archive/master.tar.gz',
    demoDatabaseURL:
        'https://github.com/dhis2/dhis2-demo-db/blob/master/sierra-leone/{version}/dhis2-db-sierra-leone.sql.gz?raw=true',
}
