(global => {
  // Map any paths encountered in `import` statements
  const map = {
    'scripts':                        '../build/debug/src/scripts',
    'bower_components':               '/bower_components',
    'components':                     '../build/debug/src/components'
  };

  const config = {
    baseUrl: '/',
    defaultJSExtensions: true,
    map: map
  };

  System.config(config);
})(this);
