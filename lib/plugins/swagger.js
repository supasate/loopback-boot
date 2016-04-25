var util = require('util');
var PluginBase = require('../base/plugin');

module.exports = function(options) {
  return new Swagger(options);
};

function Swagger(options) {
  PluginBase.call(this, options, 'apis', null);
}

util.inherits(Swagger, PluginBase);

Swagger.prototype.start = function(context) {
  var app = context.app;
  var appConfig = context.instructions.application;
  // disable token requirement for swagger, if available
  var swagger = app.remotes().exports.swagger;
  if (!swagger) return;

  var requireTokenForSwagger = appConfig.swagger &&
    appConfig.swagger.requireToken;
  swagger.requireToken = requireTokenForSwagger || false;
};
