(global => {
  // Map any paths encountered in `import` statements
  const map = {
    scripts:                        '../build/debug/src/scripts',
    components:                     '../build/debug/src/components',
  };

  System.config({
    baseUrl: '../node_modules',
    defaultJSExtensions: true,
    map
  });

})(this);
