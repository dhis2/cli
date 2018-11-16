const fs = require('fs');
const path = require('path');
const request = require("request");
const tar = require('tar');
const mkdirp = require('mkdirp');
const config = require('./ConfigLoader').config;
const reporter = require('./reporter');

class D2Cache {
  async createCacheDir(pathname) {
    await mkdirp(config.cache);
    const loc = this.getCacheLocation(pathname);
    return loc;
  }

  async exists(pathname) {
    const p = new Promise(resolve => {
      fs.exists(this.getCacheLocation(pathname), exists => {
        resolve(exists);
      });
    });
    return p;
  }

  getCacheLocation(pathname) {
    return path.join(config.cache, pathname);
  }

  async fetch(url, fileName) {
    if (force) {
      reporter.debug(`Forcing refetch of ${fileName}`);
    } else if (await this.exists(fileName)) {
      reporter.debug(`Found a cached version of ${fileName}`);
      return this.getCacheLocation(fileName);
    }
    const outDir = await this.createCacheDir(fileName);
    const outFile = path.join(outDir, fileName);

    const p = new Promise((resolve, reject) => {
      request
        .get(url)
        .on("error", e => {
          reporter.error(`Failed to fetch ${fileName} from ${url}`);
          reject();
        })
        .on("warn", reporter.warn)
        .on("end", () => resolve(outFile))
        .pipe(fs.createWriteStream(outFile));
    });

    return p;
  }
  async fetchAndExtract(url, outDirName, { force } = {}) {
    if (force) {
      reporter.debug(`Forcing re-fetch of ${outDirName}`);
    } else if ( await this.exists(outDirName)) {
      reporter.debug(`Found a cached version of ${outDirName}`);
      return this.getCacheLocation(outDirName);
    }
    const outDir = await this.createCacheDir(outDirName);

    const p = new Promise((resolve, reject) => {
      request
        .get(url)
        .on("error", (e) => {
          reporter.error(`Failed to fetch ${outDirName} from ${url}`);
          reject();
        })
        .on('warn', reporter.warn)
        .on("end", () => resolve(outDir))
        .pipe(tar.extract({ cwd: outDir }))
    });

    return p;
  }
}

module.exports = new D2Cache();