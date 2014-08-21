/**
nconf wrapper basically partially stolen from `taskcluster-base` adapted for
generator use and direct object access rather then the get syntax.
*/
var assert = require('assert');
var assign = require('object-assign');
var nconf = require('nconf');

module.exports = function* config (options) {
  // Set default options
  options = assign({
    defaults: {},
    profile: {},
    filename: null
  }, options || {});

  // Create config provider
  var cfg = new nconf.Provider();

  // Load configuration from file
  if (options.filename) {
    // Config from current working folder if present
    cfg.file('local', options.filename + '.conf.json');

    // User configuration
    cfg.file('user', '~/.' + options.filename + '.conf.json');

    // Global configuration
    cfg.file('global', '/etc/' + options.filename + '.conf.json');
  }

  // Load default values from profile
  cfg.overrides(options.profile);

  // Load defaults
  cfg.defaults(options.defaults);

  // Return all configuration options...
  return yield cfg.load.bind(cfg);
};
