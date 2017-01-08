(function(global) {
  // Map any paths encountered in `import` statements
  var map = {
    'scripts':                        '../build/debug/src/scripts',
    'bower_components':               '/bower_components',
    'components':                     '../build/debug/src/components'
  };

  var config = {
    baseUrl: '/',
    defaultJSExtensions: true,
    map: map
  };

  System.config(config);
})(this);
