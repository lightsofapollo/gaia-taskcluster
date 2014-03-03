/**
@module taskcluster-client/queue
*/

var util = require('util');
var urlJoin = require('url-join');
var config = require('./config');
var request = require('superagent-promise');

var QueueError = require('./queueerror');

var API_VERSION = 'v1';

function handleResponse(promise) {
  return promise.then(function(res) {
    if (res.error) throw new QueueError(res);
    return res.body;
  });
}

/**
HTTP api for the taskcluster queue.

@param {Object} options for the queue.
@param {String} [options.queueUrl].
@constructor
@see http://docs.taskcluster.net/queue/api-docs.html
@alias module:taskcluster-client/queue
*/
function Queue(options) {
  this.options = config(options);
}

Queue.API_VERSION = API_VERSION;

Queue.prototype = {
  /**
  Build a url for the queue (with the appropriate version). Runs string through
  util.format so placeholders can be used...

  @param {String} path to use (can use placeholders in string)
  @param {Array} [placeholders]
  @return {String} complete url for the taskcluster queue.
  */
  url: function() {
    var format = Array.prototype.slice.call(arguments);

    return urlJoin(
      this.options.queueUrl,
      API_VERSION,
      util.format.apply(util, format)
    );
  },

  /**
  Issue a request to the taskcluster queue.

  @param {String} method to issue.
  @param {String} url for the queue.
  @return {Promise<Object>}
  */
  request: function(method, url) {
    // XXX: Add authentication here...
    return request(method, url);
  },

  /**
  Fetch the amqp credentials from taskcluster queue and create an amqplib
  connection.
  @return {Promise<Object>}
  */
  amqpConnectionString: function() {
    return handleResponse(this.request(
      'GET',
      this.url('/settings/amqp-connection-string')
    ).end());
  },
  /**
  Create a new task see the {@tutorial task_factories} tutorial for usage with
  the `taskcluster-client/factory/task` module for utilities to construct the
  task body.

  @param {Object} task definition.
  @return {Promise<Object>} promise response.
  */
  postTask: function(task) {
    var req = this.request('POST', this.url('/task/new'))
                .send(task)
                .end();

    return handleResponse(req);
  },

  /**
  Fetch a task definition based on its task id.

  @param {String} taskId acquired by posting a task.
  @return {Promise<Object>} task definition promise.
  */
  getTask: function(taskId) {
    var url = urlJoin(
      this.options.tasksUrl,
      taskId,
      'task.json'
    );

    return handleResponse(request('GET', url).end());
  }

};

module.exports = Queue;
