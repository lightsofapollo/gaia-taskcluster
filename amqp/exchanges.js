/**
@fileoverview

Exchange constants and utilities for binding to queues...
*/

var util = require('util');

/**
@constant
*/
exports.QUEUE_TASK_PENDING = 'queue/v1/task-pending';

/**
@constant
*/
exports.QUEUE_TASK_RUNNING = 'queue/v1/task-running';

/**
@constant
*/
exports.QUEUE_TASK_COMPLETED = 'queue/v1/task-completed';

/**
@constant
*/
exports.QUEUE_TASK_FAILED = 'queue/v1/task-failed';

/**
@constant
*/
exports.GRAPH_RUNNING = 'scheduler/v1/task-graph-running';

/**
@constant
*/
exports.GRAPH_BLOCKED = 'scheduler/v1/task-graph-blocked';

/**
@constant
*/
exports.GRAPH_FINISHED = 'scheduler/v1/task-graph-finished';

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
var routingKey = exchange.taskRoutingKey({
  provisionerId: 'aws-provisioner',
  workerType: 'ami-xfoo'
});

// routingKey => '*.*.*.aws-provisoiner.ami-xfoo.#'

*/
exports.queueTaskRoutingKey = function(options) {
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

exports.graphTaskRoutingKey = function(options) {
  options = options || {};

  return [
   'taskId',
   'runId',
   'workerGroup',
   'workerId',
   'provisionerId',
   'workerType',
   'schedulerId',
   'taskGraphId',
   'taskGraphRouting'
  ].map(function(param) {
    return options[param] || (param == 'taskGraphRouting' ? '#' : '*');
  }).join('.');
};

