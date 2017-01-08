# Polymer TypeScript Starter Kit

[![Build Status](https://travis-ci.org/tony19/polymer-typescript-starter-kit.svg?branch=master)](https://travis-ci.org/tony19/polymer-typescript-starter-kit)

> Polymer Starter Kit w/TypeScript support

This template is a starting point for building Polymer apps (based on [Polymer Starter Kit 2.1.1](https://github.com/PolymerElements/polymer-starter-kit/releases/tag/v2.1.1))
using TypeScript.

#### Features:

 * Inline TypeScript transpilation (via `<script type="text/x-typescript>`)
 * PolymerTS
 * ...

### Quickstart

Install these packages:

 * [Node](https://nodejs.org/) 4 or newer
 * [Bower](https://bower.io/)
 * [Yarn](https://yarnpkg.com/)
 * [Polymer CLI](https://github.com/Polymer/polymer-cli)

Then run these commands to build the project and open a browser to it:

```shell
yarn
bower install
yarn build
yarn start
```

### Known Issues

 * `polymer serve -o` doesn't yet work. For now, serve the project with `yarn start`.

### Useful Gulp tasks

```shell
Usage
  gulp [TASK] [OPTIONS...]

Available tasks
  clean         Cleans output directory
  build         Builds the project (dest: build/[un]bundled)
  sw            Generates a service worker for build output
```
