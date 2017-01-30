# Polymer TypeScript Starter Kit

[![Build Status](https://travis-ci.org/tony19/polymer-typescript-starter-kit.svg?branch=master)](https://travis-ci.org/tony19/polymer-typescript-starter-kit)

> Polymer Starter Kit w/TypeScript support

*Features*

 * Inline TypeScript transpilation (via `<script type="text/x-typescript>`)
 * [PolymerTS](https://github.com/nippur72/PolymerTS)
 * Inline Sass transpilation (via `<style>`)
 * Live reload on development server

With inline TypeScript transpilation and PolymerTS, you could define elements like [this](https://github.com/tony19/polymer-typescript-starter-kit/blob/7093acd/src/components/my-view3/my-view3.html#L31-L38):

```html
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
```

You could also import TypeScript files like [this](https://github.com/tony19/polymer-typescript-starter-kit/blob/7093acd/src/components/my-view2/my-view2.html#L31):

```html
<dom-module id="my-view2">
  <template>
    <h1>[[title]]</h1>
  </template>

  <script>System.import('components/my-view2/my-view2');</script>
</dom-module>
```


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


### Gulp tasks

```shell
build         Builds HTML, styles, and scripts
clean         Deletes output directory and any intermediate files
csslint       Lints the CSS/SCSS files
html          Builds HTML files (and dependencies)
 --bundle      …bundle output
 --deps        …build dependencies
 --sw          …generate service worker
htmllint      Lints HTML files
images        Optimizes images
license       Verifies license headers
 --exclude     …glob patterns to exclude
 --include     …glob patterns to include
 -w            …write license headers if necessary
scripts       Builds all TypeScript files
serve         Starts development server
 --https       …enable https
 --port        …starting port number (default: 8080)
styles        Builds the CSS/SCSS files
tslint        Lints TypeScript files
```

### Yarn scripts
```
build         Builds (runs `gulp`)
start         Starts development server (runs `gulp serve`)
test          Builds and then runs web-component unit tests
tezt          Run non-web-component tests with code coverage
```
