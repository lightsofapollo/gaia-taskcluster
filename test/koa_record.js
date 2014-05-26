var Promise = require('promise');

module.exports = function(app) {

  /**
  Format is:

    recording['/path'] = { status: '404' };

  */
  var recording = {};
  app.waitForResponse = function (path, status) {
    return new Promise(function(accept) {
      recording[path] = { status: status, callback: accept };
    });
  };

  return function * (next) {
    var path = this.path;

    // skip this middleware we don't need to do anything
    if (!recording[path]) return (yield next);

    // wait for response
    yield next

    if (recording[path].status === this.status) {
      recording[path].callback(this);
    }
  }

};
