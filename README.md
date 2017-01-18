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


### Useful Gulp tasks

```shell
Usage
  gulp [TASK] [OPTIONS...]

Available tasks
  build         Clean builds project (dest: build/[un]bundled)
  clean         Cleans output directory
  csslint       Lints CSS files
  html          Builds HTML files and dependencies
  htmllint      Lints HTML files
  scripts       Builds TypeScript files
  serve         Starts development server (use `--port` to change port)
  styles        Builds CSS/Sass files
  tslint        Lints TypeScript files
```
