var util = require('util');
var utils = require('../base/utils');
var PluginBase = require('../base/plugin');
var debug = require('debug')('loopback:boot:datasource');

module.exports = function(options) {
  return new DataSource(options);
};

function DataSource(options) {
  PluginBase.call(this, options, 'dataSources', 'datasources');
}

util.inherits(DataSource, PluginBase);

DataSource.prototype.getRootDir = function() {
  return this.options.dsRootDir;
};

DataSource.prototype.start = function(context) {
  var app = context.app;
  utils.forEachKeyedObject(context.instructions[this.name], function(key, obj) {
    debug('Registering data source %s', key);
    app.dataSource(key, obj);
  });
};

