const os = require('os')
const path = require('path')

module.exports = {
    verbose: false,
    cache: path.join(os.homedir(), '.cache/d2'),
    cluster: {
        dockerComposeRepository:
            'https://github.com/amcgee/dhis2-backend/archive/master.tar.gz',
        demoDatabaseURL:
            'https://github.com/dhis2/dhis2-demo-db/blob/master/sierra-leone/{version}/dhis2-db-sierra-leone.sql.gz?raw=true',
    },
}
