/**
Terrible utility to add a .body property to all responses which are json.

@example

var http = require('http');
var app = require('...someapp...');

http.createServer(function(req, res) {
  recordJSON(req, res);
  app(req, res);
});

*/
function recordJSON(req, res) {
  var buffer;
  // single string values are always sent via end
  var oldend = res.end;

  // override the old end to observe the value of the original
  res.end = function(value) {
    buffer = value;
    oldend.apply(this, arguments);
  };

  // when the response has been sent
  res.once('finish', function() {
    // check if the value if json (we only care about json)
    if (res.getHeader('Content-Type').indexOf('json') !== -1) {
      // then add it as a body parameter like superagent/express
      res.body = JSON.parse(buffer);
    }
  });
}

module.exports = recordJSON;
