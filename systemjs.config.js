(global => {
  // Map any paths encountered in `import` statements
  const map = {
    'scripts':                        '/src/scripts',
    'bower_components':               '/bower_components',
    'components':                     '/src/components'
  };

  const config = {
    baseUrl: '/',
    defaultJSExtensions: true,
    map: map
  };

  System.config(config);
})(this);
