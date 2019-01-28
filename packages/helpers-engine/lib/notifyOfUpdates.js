const updateNotifier = require('update-notifier')

module.exports = (pkg, opts = {}) => {
    updateNotifier(
        Object.assign(
            {
                pkg,
                updateCheckInterval: 1000 * 60 * 60 * 24, //daily
            },
            opts
        )
    ).notify()
}
