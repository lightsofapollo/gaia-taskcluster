/**
Creates a graph from a github pull request.

@module graph/github
*/
var Promise = require('promise');
var GraphFactory = require('taskcluster-task-factory/graph');
var decorate = require('./decorate').decorate;
var debug = require('debug')('github-taskcluster:graph:github_pr');
var fetchOwnerFromLogin = require('./github_login');

/**
Fetch the graph (but do not decorate it) from the pull request.

@return {Promise<Object>} raw graph as defined in the repository.
*/
function* fetchGraph(github, pushEvent) {
  var repo = github.getRepo(
    pushEvent.repository.owner.name,
    pushEvent.repository.name
  );

  var ref = yield repo.git.getRef(pushEvent.ref.split('refs/').pop());
  var content = yield repo.git.getContents('taskgraph.json', ref)

  return JSON.parse(content);
}

module.exports.fetchGraph = fetchGraph;

/**
Decorate the given graph object with the pull request data.

@return {Promise<Object>} graph result object.
*/
function* decorateGraph(graph, treeherderProject, github, pushEvent) {
  var headCommit = pushEvent.head_commit || pushEvent.commits[0];
  var committerUsername = headCommit.committer.username;
  var commitSha = headCommit.id;

  // environment variables these do not override if set in the task.
  var envs = {
    CI: true,
    // we use the label since it's available from the PR but not the
    // prefix (so this would be master instead of repo:master)
    GH_BRANCH: pushEvent.ref.split('/').pop(),
    GH_COMMIT: commitSha,
    GH_PULL_REQUEST: 'false',
    GH_REPO_SLUG: pushEvent.repository.owner.name + '/' +
                  pushEvent.repository.name
  };

  // tag data is always overridden
  var tags = {
    commit: commitSha,
    repository: pushEvent.repository.url,
    githubUsername: committerUsername,
    treeherderResultset: commitSha,
    treeherderProject: treeherderProject.name
  };

  var owner = yield fetchOwnerFromLogin(github, committerUsername);

  return GraphFactory.create(decorate(
    graph,
    envs,
    tags,
    { owner: owner, source: '/' }
  ));
}

module.exports.decorateGraph = decorateGraph;
