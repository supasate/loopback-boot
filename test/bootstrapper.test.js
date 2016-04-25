var path = require('path');
var loopback = require('loopback');
var Bootstrapper = require('../lib/bootstrapper').Bootstrapper;

describe('Bootstrapper', function() {
  var bootstrapper;

  before(function(done) {
    var app = loopback();

    var options = {
      app: app,
      appRootDir: path.join(__dirname, './fixtures/simple-app')
    };
    process.bootFlags = [];
    bootstrapper = new Bootstrapper(options);
    options.bootstrapper = bootstrapper;

    var context = {
      app: app
    };

    bootstrapper.run(context, done);
  });

  after(function(done) {
    delete process.bootFlags;
  });

});
