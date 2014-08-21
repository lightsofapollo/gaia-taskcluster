var logger = require('json-logger');
/**
Instance level configuration and runtime methods/logging.
*/
function Runtime(config) {
  for (var key in config) this[key] = config[key];
  this.log = logger({
    queue: this.queue || '<no queue>'
  });
}

// See the config/defaults.js for properties...
Runtime.prototype = {};

module.exports = Runtime;
