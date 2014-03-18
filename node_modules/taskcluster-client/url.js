/**
URL formatting utility.

@module taskcluster-client/url
*/
var util = require('util');
var urlJoin = require('url-join');

/**
@param {String} part... part of url (can be a path or host, etc..)
@param {Array} placeholders for the util.format call.
*/
function url() {
  var parts = Array.prototype.slice.call(arguments);
  var placeholders = parts.pop();

  return util.format.apply(
    util,
    [
      urlJoin.apply(urlJoin, parts)
    ].concat(placeholders)
  );
}

module.exports = url;
