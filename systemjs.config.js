(global => {
  // Map any paths encountered in `import` statements
  const map = {
    scripts:                        '/src/scripts',
    components:                     '/src/components'
  };

  System.config({
    baseUrl: '/',
    defaultJSExtensions: true,
    map
  });

})(this);
