import * as path from 'path';

const config = {
  polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
  build: {
    rootDirectory: 'build',
    bundledDirectory: 'bundled',
    unbundledDirectory: 'unbundled',
    debugDirectory: 'debug',
    // Accepts either 'bundled', 'unbundled', or 'both'
    // A bundled version will be vulcanized and sharded. An unbundled version
    // will not have its files combined (this is for projects using HTTP/2
    // server push). Using the 'both' option will create two output projects,
    // one for bundled and one for unbundled
    // TODO: Add flag to enable bundling. Use only 'unubundled' for now
    // because of https://github.com/Polymer/polymer-build/issues/110.
    bundleType: 'unbundled'
  },
  // Path to your service worker, relative to the build root directory
  serviceWorkerPath: 'service-worker.js',
  // Service Worker precache options based on
  // https://github.com/GoogleChrome/sw-precache#options-parameter
  swPrecacheConfig: {
    navigateFallback: '/index.html'
  }
};

/**
 * Gets the bundled-build dir only if config.bundleType is either
 * 'both' or 'bundled'.
 * @returns path to bundled-build directory
 */
config.getBundledDir = () => {
  return ['both', 'bundled'].includes(config.build.bundleType) &&
    path.join(
      config.build.rootDirectory,
      config.build.bundledDirectory
    );
};

/**
 * Gets the unbundled-build dir only if config.bundleType is either
 * 'both' or 'unbundled'.
 * @returns path to unbundled-build directory
 */
config.getUnbundledDir = () => {
  return ['both', 'unbundled'].includes(config.build.bundleType) &&
    path.join(
      config.build.rootDirectory,
      config.build.unbundledDirectory
    );
};

config.getDebugDir = () => {
  return path.join(
    config.build.rootDirectory,
    config.build.debugDirectory
  );
};

module.exports = config;
