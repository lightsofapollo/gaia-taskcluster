/**
Creates a graph from a github pull request.

@module graph/github
*/
var Promise = require('promise');
var GraphFactory = require('taskcluster-client/factory/graph');

/**
Fetch the graph (but do not decorate it) from the pull request.

@return {Promise<Object>} raw graph as defined in the repository.
*/
function fetchGraph(github, pullRequest) {
  // XXX: Obviously this is a hack this will fetch from the repository
  //      directly in the future.
  return Promise.cast(GraphFactory.create(require('./hardcoded_graph')));
}

module.exports.fetchGraph = fetchGraph;

/**
Decorate the given graph object with the pull request data.

@return {Promise<Object>} graph result object.
*/
function decorateGraph(graph, github, pullRequest) {
  // environment variables these do not override if set in the task.
  var envs = {
    CI: true,
    // we use the label since it's available from the PR but not the
    // prefix (so this would be master instead of repo:master)
    GH_BRANCH: pullRequest.base.label.split(':').pop(),
    GH_COMMIT: pullRequest.base.sha,
    GH_PULL_REQUEST: 'true',
    GH_PULL_REQUEST_NUMBER: pullRequest.number,
    GH_REPO_SLUG: pullRequest.base.repo.full_name
  };

  // metadata is always overridden
  var tags = {
    commit: pullRequest.head.sha,
    repository: pullRequest.base.repo.html_url,
    pullRequest: pullRequest.html_url,
    githubUsername: pullRequest.head.user.login,
    treeherderResultset: pullRequest.html_url
  };

  // iterate through all the tasks and decorate them with the details.
  Object.keys(graph.tasks).forEach(function(name) {
    var task = graph.tasks[name];
    var definition = task.task;
    var taskEnvs = definition.payload.env = definition.payload.env || {};
    var taskTags = definition.tags = definition.tags || {};

    var key;
    for (key in tags) {
      taskTags[key] = tags[key];
    }

    for (key in envs) {
      if (!(key in taskEnvs)) {
        taskEnvs[key] = envs[key];
      }
    }
  });

  return Promise.cast(graph);
}

module.exports.decorateGraph = decorateGraph;
