var util = require('util');
var debug = require('debug')('loopback:boot:component');
var PluginBase = require('../base/plugin');

var utils = require('../base/utils');

var resolveAppScriptPath = utils.resolveAppScriptPath;

module.exports = function(options) {
  return new Component(options);
};

function Component(options) {
  PluginBase.call(this, options, 'components', 'component-config');
}

util.inherits(Component, PluginBase);

Component.prototype.buildInstructions = function(context, rootDir, config) {
  return Object.keys(config)
    .filter(function(name) {
      return !!config[name];
    }).map(function(name) {
      return {
        sourceFile: resolveAppScriptPath(rootDir, name, {strict: true}),
        config: config[name]
      };
    });
};

Component.prototype.start = function(context) {
  var app = context.app;
  var self = this;
  context.instructions[this.name].forEach(function(data) {
    debug('Configuring component %j', data.sourceFile);
    var configFn = require(data.sourceFile);
    data.config = self.getUpdatedConfigObject(context, data.config);
    configFn(app, data.config);
  });
};
