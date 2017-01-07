# Polymer Starter Kit with TypeScript support

[![Build Status](https://travis-ci.org/tony19/polymer-typescript-starter-kit.svg?branch=master)](https://travis-ci.org/tony19/polymer-typescript-starter-kit)

This template is a starting point for building Polymer apps (based on Polymer Starter Kit)
using TypeScript.

### Quickstart
Run these commands to install dependencies, build the project, start a local server, and open a browser to the app.

```shell
yarn
bower
npm run build
npm run start
```

### Known Issues

 * Live reload (and `polymer serve -o`) does not yet work. Build the output, and serve it with `polymer serve build/unbundled -o` (or `npm run start`).

### Roadmap

 * Live reload (and `polymer serve -o`)
 * Inline typescript transpilation (i.e., in `<script type="text/x-typescript>`)
 * PolymerTS support

### Setup

##### Prerequisites

 * Node 4 or newer
 * Bower
 * [polymer-cli](https://github.com/Polymer/polymer-cli)

### Start the development server

This command serves the app at `http://localhost:8080` and provides basic URL
routing for the app:

    polymer serve --open


### Build

This command performs HTML, CSS, and JS minification on the application
dependencies, and generates a service-worker.js file with code to pre-cache the
dependencies based on the entrypoint and fragments specified in `polymer.json`.
The minified files are output to the `build/unbundled` folder, and are suitable
for serving from a HTTP/2+Push compatible server.

In addition the command also creates a fallback `build/bundled` folder,
generated using fragment bundling, suitable for serving from non
H2/push-compatible servers or to clients that do not support H2/Push.

    npm run build

### Preview the build

This command serves the minified version of the app at `http://localhost:8080`
in an unbundled state, as it would be served by a push-compatible server:

    polymer serve build/unbundled -o

This command serves the minified version of the app at `http://localhost:8080`
generated using fragment bundling:

    polymer serve build/bundled -o

### Run tests

This command will run
[Web Component Tester](https://github.com/Polymer/web-component-tester) against the
browsers currently installed on your machine.

    polymer test

### Adding a new view

You can extend the app by adding more views that will be demand-loaded
e.g. based on the route, or to progressively render non-critical sections
of the application.  Each new demand-loaded fragment should be added to the
list of `fragments` in the included `polymer.json` file.  This will ensure
those components and their dependencies are added to the list of pre-cached
components (and will have bundles created in the fallback `bundled` build).