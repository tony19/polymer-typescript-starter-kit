(function(global) {
  // Map any paths encountered in `import` statements
  var map = {
    'scripts':                        '/src/scripts',
    'bower_components':               '/bower_components',
    'components':                     '/src/components'
  };

  var config = {
    baseUrl: '/',
    defaultJSExtensions: true,
    map: map
  };

  System.config(config);
})(this);