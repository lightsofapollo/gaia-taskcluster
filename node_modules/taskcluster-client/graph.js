/**
@module taskcluster-client/graph
*/

var config = require('./config');
var request = require('superagent-promise');
var formatUrl = require('./url');

var HttpError = require('./httperror');

var API_VERSION = '/v1/';

/**
HTTP api for the taskcluster graph.

@param {Object} options for the graph.
@param {String} [options.graphUrl].
@constructor
@see http://docs.taskcluster.net/scheduler/api-docs/
@alias module:taskcluster-client/graph
*/
function Graph(options) {
  this.options = config(options);
}

Graph.API_VERSION = API_VERSION;

Graph.prototype = {
  /**
  @param {Object} graph object to insert into.
    See the {@link module:taskcluster-client/factory/graph|graph factory}
    for helpers to generate this.
  @return {Promise<Object>} promise for the result of the insertion.
  */
  create: function(graph) {
    var url = formatUrl(
      this.options.graphUrl,
      API_VERSION,
      '/task-graph/create',
      []
    );

    return request
      .post(url)
      .send(graph)
      .end()
      .then(HttpError.responseHandler);
  }
};

module.exports = Graph;

