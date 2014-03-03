/**
shared configuration generation for various modules.

@module taskcluster-client/config
*/

/**
XXX: this should be https and in the mozilla subdomain.

@constant
*/
var DEFAULT_TASKCLUSTER_QUEUE = 'http://queue.taskcluster.net';

/**
Default location where task definitions can be fetched from.
@constant
*/
var DEFAULT_TASKCLUSTER_TASK_BUCKET = 'http://tasks.taskcluster.net';

/**
@param {Object} [options] configuration details for TC.
@param {Object} [options.queueUrl] protocol + host for queue url.
@param {Object} [options.tasksUrl] protocol + host for tasks location.
@return {Object} full configuration for taskcluster
*/
function config(options) {
  options = options || {};

  return {
    queueUrl: options.queueUrl || DEFAULT_TASKCLUSTER_QUEUE,
    tasksUrl: options.tasksUrl || DEFAULT_TASKCLUSTER_TASK_BUCKET
  };
}

module.exports = config;
