# Polymer TypeScript Starter Kit

[![Build Status](https://travis-ci.org/tony19/polymer-typescript-starter-kit.svg?branch=master)](https://travis-ci.org/tony19/polymer-typescript-starter-kit)

> Polymer Starter Kit w/TypeScript support

This template is a starting point for building Polymer apps (based on [Polymer Starter Kit 2.1.1](https://github.com/PolymerElements/polymer-starter-kit/releases/tag/v2.1.1))
using TypeScript, featuring:

 * Inline TypeScript transpilation (via `<script type="text/x-typescript>`)
 * [PolymerTS](https://github.com/nippur72/PolymerTS)
 * Live reload on development server

With inline TypeScript transpilation and PolymerTS, you could define elements like this:

    <dom-module id="my-view3">
      <template>
        <h1>[[title]]</h1>
      </template>

      <script type="text/x-typescript">
        @component('my-view3')
        class MyView3 extends polymer.Base {
          @property()
          title = 'View Three';
        }
        MyView3.register();
      </script>
    </dom-module>

You could also import TypeScript files like this:

    <dom-module id="my-view2">
      <template>
        <h1>[[title]]</h1>
      </template>

      <script>System.import('components/my-view2/my-view2');</script>
    </dom-module>


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
yarn start
```


### Useful Gulp tasks

```shell
Usage
  gulp [TASK] [OPTIONS...]

Available tasks
  clean         Cleans output directory
  build         Clean builds project (dest: build/[un]bundled)
  html          Builds HTML files and dependencies
  htmllint      Lints HTML files
  scripts       Builds TypeScript files
  serve         Starts development server (use `--port` to change port)
  sw            Generates service worker for build output
  tslint        Lints TypeScript files
```
