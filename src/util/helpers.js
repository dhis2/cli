const colors = require('colors');
const { reporter } = require('commandant');

module.exports.tryCatchAsync = async (name, promise) => {
  if (arguments.length === 1) {
    promise = name;
    name = 'anonymous';
  }
  try {
    return {
      err: null,
      out: await promise
    }
  } catch (e) {
    reporter.debug(`tryCatchAsync(${colors.bold(name)}) error: ${e}`);
    return { err: e || 'unknown', out: null};
  }
}