var async = require('async');
var debug = require('debug')('loopback:boot:bootstrapper');
var Promise = global.Promise || require('bluebird');

module.exports = function(options) {
  return new Bootstrapper(options);
};

module.exports.Bootstrapper = Bootstrapper;

function createPromiseCallback() {
  var cb;
  var promise = new Promise(function(resolve, reject) {
    cb = function(err, data) {
      if (err) return reject(err);
      return resolve(data);
    };
  });
  cb.promise = promise;
  return cb;
}

var builtinPlugins = [
  'application', 'datasource', 'model', 'mixin',
  'middleware', 'component', 'boot-script', 'swagger'
];

var builtinPhases = [
  'load', 'compile', 'starting', 'start', 'started'
];

function Bootstrapper(options) {
  this.plugins = [];
  options = options || {};

  if (typeof options === 'string') {
    options = {appRootDir: options};
  }

  var appRootDir = options.appRootDir = options.appRootDir || process.cwd();
  var env = options.env || process.env.NODE_ENV || 'development';

  var appConfigRootDir = options.appConfigRootDir || appRootDir;

  options.rootDir = appConfigRootDir;
  options.env = env;
  this.options = options;

  this.phases = options.phases || builtinPhases;

  var self = this;
  builtinPlugins.forEach(function(p) {
    var factory = require('./plugins/' + p);
    self.use('/boot/' + p, factory(options));
  });
}

Bootstrapper.prototype.use = function(path, handler) {
  var plugin = {
    path: path,
    handler: handler
  };
  this.plugins.push(plugin);
};

Bootstrapper.prototype.getPlugins = function(path) {
  if (path[path.length - 1] !== '/') {
    path = path + '/';
  }
  return this.plugins.filter(function(p) {
    return p.path.indexOf(path) === 0;
  });
};

Bootstrapper.prototype.getExtensions = function(path) {
  if (path[path.length - 1] !== '/') {
    path = path + '/';
  }
  return this.plugins.filter(function(p) {
    if (p.path.indexOf(path) === -1) return false;
    var name = p.path.substring(path.length);
    return name && name.indexOf('/') === -1;
  });
};

Bootstrapper.prototype.run = function(context, done) {
  if (!done) {
    done = createPromiseCallback();
  }
  var options = this.options;
  var appRootDir = options.appRootDir = options.appRootDir || process.cwd();
  var env = options.env || process.env.NODE_ENV || 'development';

  var appConfigRootDir = options.appConfigRootDir || appRootDir;

  options.rootDir = appConfigRootDir;
  options.env = env;

  context = context || {};

  var phases = context.phases || this.phases;
  var bootPlugins = this.getExtensions('/boot');
  async.eachSeries(phases, function(phase, done) {
    debug('Phase %s', phase);
    async.eachSeries(bootPlugins, function(plugin, done) {
      var result;
      if (typeof plugin.handler[phase] === 'function') {
        debug('Invoking %s.%s', plugin.handler.name, phase);
        try {
          if (plugin.handler[phase].length === 2) {
            plugin.handler[phase](context, done);
          } else {
            result = plugin.handler[phase](context);
            if (typeof Promise !== 'undefined') {
              if (result && typeof result.then === 'function') {
                result.then(function(value) {
                  done(null, value);
                }).catch(function(err) {
                  debug(err);
                  done(err);
                });
              } else {
                done(null, result);
              }
            } else {
              done(null, result);
            }
          }
        } catch (err) {
          debug(err);
          done(err);
        }
      } else {
        debug('Skipping %s.%s', plugin.handler.name, phase);
        return done();
      }
    }, done);
  }, done);
  return done.promise;
};

