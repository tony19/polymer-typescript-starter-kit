const path = require('path');

module.exports = {
  buildRoot: global.config.build.rootDirectory,

  bundledDir: ['both', 'bundled'].includes(global.config.build.bundleType) &&
              path.join(global.config.build.rootDirectory,
                        global.config.build.bundledDirectory),

  unbundledDir: ['both', 'unbundled'].includes(global.config.build.bundleType) &&
                path.join(global.config.build.rootDirectory,
                          global.config.build.unbundledDirectory),

  debugDir: path.join(global.config.build.rootDirectory,
                    global.config.build.debugDirectory),
};
