const fs = require('fs')
const rimraf = require('rimraf')

module.exports.rimraf = dir => {
    return new Promise((resolve, reject) => {
        rimraf(dir, err => {
            if (err) return reject(err)
            resolve(true)
        })
    })
}
module.exports.exists = p => {
    return new Promise(resolve => {
        fs.exists(p, exists => {
            resolve(exists)
        })
    })
}

module.exports.rename = (a, b) => {
    return new Promise((resolve, reject) => {
        fs.rename(a, b, err => {
            if (err) return reject(err)
            resolve(true)
        })
    })
}
module.exports.readdir = path =>
    new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) return reject(err)
            resolve(files)
        })
    })

module.exports.stat = path =>
    new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) return reject(err)
            resolve(stats)
        })
    })
