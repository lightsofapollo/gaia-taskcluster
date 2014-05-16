/**
Creates a graph from a github pull request.

@module graph/github
*/
var Promise = require('promise');
var GraphFactory = require('taskcluster-task-factory/graph');
var decorate = require('./decorate').decorate;
var debug = require('debug')('github-taskcluster:graph:github_pr');
var fetchOwnerFromLogin = require('./github_login');

var TASKGRAPH_PATH = require('./decorate').TASKGRAPH_PATH;

function pullRequestResultsetId(pr) {
  var id =
    // prefix so pull requests are distinct from other things
    'pr-' +
    // pull request number is unique per project
    pr.number +
    '-' +
    // repository is is unique globally on github and will stay the same
    // even if the repository is renamed
    pr.base.repo.id;

  return id;
}

exports.pullRequestResultsetId = pullRequestResultsetId;

/**
Fetch the graph (but do not decorate it) from the pull request.

@return {Promise<Object>} raw graph as defined in the repository.
*/
function* fetchGraph(github, pullRequest) {
  debug(
    'Fetching graph from repository',
    pullRequest.head.user.login,
    pullRequest.head.repo.name
  );

  var repo = github.getRepo(
    pullRequest.base.user.login, // user
    pullRequest.base.repo.name // repo
  );

  var ref = yield repo.git.getRef('pull/' + pullRequest.number + '/merge');
  var content = yield repo.git.getContents('taskgraph.json', ref)

  return content;
}

module.exports.fetchGraph = fetchGraph;

/**
Decorate the given graph object with the pull request data.

@return {Promise<Object>} graph result object.
*/
function* decorateGraph(graph, treeherderProject, github, pullRequest) {
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

  // tag data is always overridden
  var tags = {
    commit: pullRequest.head.sha,
    repository: pullRequest.base.repo.html_url,
    pullRequest: pullRequest.html_url,
    githubUsername: pullRequest.head.user.login,
    treeherderResultset: pullRequestResultsetId(pullRequest),
    treeherderProject: treeherderProject.name,
  };

  var owner = yield fetchOwnerFromLogin(
    github,
    pullRequest.head.user.login
  );

  return GraphFactory.create(decorate(
    graph,
    envs,
    tags,
    // XXX: Add real source!
    { owner: owner, source: '/' }
  ));
}

module.exports.decorateGraph = decorateGraph;

function buildGraph(github, project, pullRequest) {
  return fetchGraph(github, pullRequest).then(function(graph) {
    return decorateGraph(graph, project, github, pullRequest);
  });
}

module.exports.buildGraph = buildGraph;
