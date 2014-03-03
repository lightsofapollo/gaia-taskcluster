/**
@fileoverview

Builds error objects from failed (non 200 range) http requests.

@module taskcluster-client/queueerror
*/
var util = require('util');

/**
Add indentation to the given source string.
@private
*/
function indent(source, level) {
  var spacer = '';
  for (var i = 0; i < level; i++) {
    spacer += ' ';
  }

  return source.split('\n').map(function(string) {
    return spacer + string;
  }).join('\n');
}

/**
@constructor
@param {Response} response from supergent request.
@alias module:mozilla-treeherder/httperror
*/
function HttpError(response) {
  var httpErr = response.error;
  var body = {};

  if (typeof response.body === 'object') {
    body = response.body;
  }

  // inherit from the error object
  Error.call(this);
  // build nice human consumable stacks
  Error.captureStackTrace(this, arguments.callee);

  this.name = 'taskcluster-queue-error';
  this.status = httpErr.status;
  this.method = httpErr.method;
  this.path = httpErr.path;

  var validation = '';
  if (body && body.error && Array.isArray(body.error)) {
    // This is super ugly bug it is good enough for now...
    body.error.forEach(function(object) {
      validation += indent(JSON.stringify(object, null, 2), 8) + '\n\n';
    });
  }

  this.message = util.format(
    '[%s %s %s] %s\n%s',
    this.method,
    this.path,
    this.status,
    body.message || httpErr.message,
    validation
  );
}

HttpError.prototype = Object.create(Error.prototype);

module.exports = HttpError;
