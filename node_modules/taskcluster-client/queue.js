/**
@module taskcluster-client/queue
*/

var config = require('./config');
var request = require('superagent-promise');
var formatUrl = require('./url');

var HttpError = require('./httperror');

var API_VERSION = '/v1/';

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
  Fetch the amqp credentials from taskcluster queue and create an amqplib
  connection.
  @return {Promise<Object>}
  */
  amqpConnectionString: function() {
    var url = formatUrl(
      this.options.queueUrl,
      API_VERSION,
      '/settings/amqp-connection-string',
      []
    );

    return request
      .get(url)
      .end()
      .then(HttpError.responseHandler);
  },
  /**
  Create a new task see the {@tutorial task_factories} tutorial for usage with
  the `taskcluster-client/factory/task` module for utilities to construct the
  task body.

  @param {Object} task definition.
  @return {Promise<Object>} promise response.
  */
  postTask: function(task) {
    var url = formatUrl(this.options.queueUrl, API_VERSION, '/task/new', []);

    return request
      .post(url)
      .send(task)
      .end()
      .then(HttpError.responseHandler);
  },

  /**
  Fetch the status of the given task and return a task status structure.

  @param {String} taskId to fetch status of.
  @return {Promise<Object>} promise response.
  */
  taskStatus: function(taskId) {
    var url = formatUrl(
      this.options.queueUrl,
      API_VERSION,
      '/task/%s/status',
      [taskId]
    );

    return request
      .get(url)
      .end()
      .then(HttpError.responseHandler);
  },

  /**
  Fetch a task definition based on its task id.

  @param {String} taskId acquired by posting a task.
  @return {Promise<Object>} task definition promise.
  */
  getTask: function(taskId) {
    var url = formatUrl(
      this.options.tasksUrl + '/%s/%s',
      [taskId, 'task.json']
    );

    return request
      .get(url)
      .end()
      .then(HttpError.responseHandler);
  }

};

module.exports = Queue;
