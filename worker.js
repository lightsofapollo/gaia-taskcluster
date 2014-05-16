var assert = require('assert');
var amqplib = require('amqplib');
var projectConfig = require('./project_config');
var Taskcluster = require('taskcluster-client');
var TaskConsumer = require('./amqp/task_consumer');
var Schema = require('./amqp/schema');

/**
amqp worker which is responsible for posting tasks to treeherder.

@param {Object} options for the worker.

@param {String} options.queue
  queue name for the worker (one will automatically be generated if not provided.

@param {Object} [options.queueConfig]
  configuration options for the queue see
  [amqplib](http://squaremo.github.io/amqp.node/doc/channel_api.html#toc_16)

@param {Number} [options.prefetch=100] number of items to work concurrently.
*/
function worker(options) {
  assert(options.queue, 'queue name is required');

  // XXX: 100 is a random guess but should be high enough for
  //      development but not too high as to overwhelm taskcluster or
  //      treeherder.
  options.prefetch = options.prefetch || 100;

  // connection placeholder we need to get the credentials from the
  // queue first...
  var connection;

  // placeholder for the amqp consumer.
  var consumer;

  // http interface to the taskcluster queue
  var queue = Taskcluster.queue;

  var schema = new Schema(options.queue, options.queueConfig || {
    // default to auto delete if no queue configuration is given
    autoDelete: true
  });

  // placeholder for all project configurations.
  var projects;

  var configUri = process.env.TREEHEDER_PROJECT_CONFIG_URI;
  return projectConfig(configUri).then(function(config) {
    projects = config;
  }).then(function() {
    return queue.getAMQPConnectionString();
  }).then(function(body) {
    return amqplib.connect(body.url, {
      // heartbeat every 2 minutes (XXX: should this be configurable?)
      heartbeat: 60 * 2
    });
  }).then(function(amqpCon) {
    connection = amqpCon;

    // define our queue and bind to the appropriate exchanges
    return schema.define(connection);
  }).then(function(define) {
    consumer = new TaskConsumer(connection, projects, queue);

    return consumer.consume(options.queue, {
      // prefetching is really important so we don't get overwhelmed by
      // messages if the buffer is very large.
      prefetch: options.prefetch
    });
  });
}

module.exports = worker;
