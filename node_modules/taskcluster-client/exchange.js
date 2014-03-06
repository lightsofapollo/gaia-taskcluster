/**
@fileoverview

Exchange constants and utilities for binding to queues...

@module taskcluster-client/exchange
@tutorial binding_with_amqpworkers
*/

var util = require('util');

/**
queue messages for pending tasks.
@constant
*/
exports.QUEUE_TASK_PENDING = 'queue/v1/task-pending';

/**
queue messages for running tasks.
@type String
@constant
*/
exports.QUEUE_TASK_RUNNING = 'queue/v1/task-running';

/**
queue messages for completed tasks.
@constant
*/
exports.QUEUE_TASK_COMPLETED = 'queue/v1/task-completed';

/**
queue messages for failed tasks.
@constant
*/
exports.QUEUE_TASK_FAILED = 'queue/v1/task-failed';

/**
Rollup of all task related exchanges

@type Array
@constant
*/
exports.QUEUE_TASKS = [
  exports.QUEUE_TASK_PENDING,
  exports.QUEUE_TASK_RUNNING,
  exports.QUEUE_TASK_COMPLETED,
  exports.QUEUE_TASK_FAILED
];

/**
@param {Object} options for the routing key.
@param {String} [options.taskId=*]
@param {String} [options.runId=*]
@param {String} [options.workerGroup=*]
@param {String} [options.provisionerId=*]
@param {String} [options.workerType=*]
@param {String} [options.taskRouting=#]
  defaults to # to allow additional dots (.)
@see http://docs.taskcluster.net/queue/events.html#toc_1
@return {String} routing key based on the object params.

@example
var exchange = require('taskcluster-client/exchange');

var routingKey = exchange.taskRoutingKey({
  provisionerId: 'aws-provisioner',
  workerType: 'ami-xfoo'
});

// routingKey => '*.*.*.aws-provisoiner.ami-xfoo.#'

*/
exports.taskRoutingKey = function(options) {
  options = options || {};

  return [
   'taskId',
   'runId',
   'workerGroup',
   'workerId',
   'provisionerId',
   'workerType',
   'taskRouting'
  ].map(function(param) {
    return options[param] || (param == 'taskRouting' ? '#' : '*');
  }).join('.');
};

/**
*/
