var Promise = require('promise');
/**
XXX: This should be it's own module

@param {String} path for the incoming http request.
@param {Number} status to wait for.
@return Promise<Array[HttpRequest,HttpResponse]>
*/
function waitForServerResponse(server, path, status) {
  return new Promise(function(accept, reject) {
    function request(req, res) {
      if (req.path !== path) return;
      res.once('finish', response.bind(this, req, res));
    }

    function response(req, res) {
      if (res.statusCode == status) {
        // the promise can only resolve once but be a good person...
        server.removeListener('request', request);
        accept([req, res]);
      }
    }

    server.on('request', request);
  });
}

module.exports = waitForServerResponse;
