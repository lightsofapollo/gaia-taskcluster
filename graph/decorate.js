/**
Common graph decoration utilities
*/

module.exports.TASKGRAPH_PATH = 'taskgraph.json';

module.exports.DEFAULT_PROVISIONER =
  process.env.TASKCLUSTER_PROVISIONER_ID || 'aws-provisioner';

module.exports.DEFAULT_WORKER_TYPE =
  process.env.TASKCLUSTER_WORKER_TYPE || 'aufs-worker';

module.exports.ROUTING_KEY =
  process.env.TASKCLUSTER_ROUTING_KEY + '.';

var assert = require('assert');

/**
Perform common decoration functions on the graph.

@param {Object} graph in its original state.
@param {Object} envs these values will not override the graph ones.
@param {Object} tags these values will override the graph ones.
@param {Object} metadata these values will override the graph ones.
*/
function decorate(graph, envs, tags, metadata) {
  assert(typeof envs === 'object', 'envs is an object');
  assert(typeof tags === 'object', 'tags is an object');
  assert(typeof metadata === 'object', 'metadata is an object');

  // we need to override this in all cases so we get notifications for the
  // individual tasks and for the overall graph progress...
  graph.routing = module.exports.ROUTING_KEY;
  graph.tags = graph.tags || {};
  graph.metadata = graph.metadata || {};
  graph.params = graph.params || {};

  // apply the given tags and metadata to the graph too
  for (var key in metadata) {
    graph.metadata[key] = metadata[key];
  }

  for (var key in tags) {
    graph.tags[key] = tags[key];
  }

  // iterate through all the tasks and decorate them with the details.
  Object.keys(graph.tasks).forEach(function(name) {
    var task = graph.tasks[name];
    var definition = task.task;

    var payload = definition.payload;

    // XXX: default timeouts hack
    payload.maxRunTime = payload.maxRunTime || 7200;

    var taskEnvs = payload.env = payload.env || {};
    var taskTags = definition.tags = definition.tags || {};
    var taskMeta = definition.metadata = definition.metadata || {};

    /**
    We add defaults to the provisionerId and workerType mostly so we can change
    these in the server configuration until we have stabilized a bit more.
    */
    definition.provisionerId =
      definition.provisionerId || module.exports.DEFAULT_PROVISIONER;

    definition.workerType =
      definition.workerType || module.exports.DEFAULT_WORKER_TYPE;

    var key;
    for (key in tags) {
      taskTags[key] = tags[key];
    }

    for (key in metadata) {
      taskMeta[key] = metadata[key];
    }

    for (key in envs) {
      if (!(key in taskEnvs)) {
        taskEnvs[key] = envs[key];
      }
    }
  });

  return graph;
}

module.exports.decorate = decorate;
