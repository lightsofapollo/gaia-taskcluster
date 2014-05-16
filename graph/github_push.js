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
function fetchGraph(github, pushEvent) {
  var ref = pushEvent.ref;
  var respository = pushEvent.repository;

  debug(
    'Fetching graph from repository',
    respository.owner.name,
    respository.name
  );

  var content = Promise.denodeify(
    github.repos.getContent.bind(github.repos)
  );

  var contentRequest = {
    user: respository.owner.name,
    repo: respository.name,
    path: require('./decorate').TASKGRAPH_PATH,
    ref: ref
  };

  debug('requesting graph content with', contentRequest);

  return content(contentRequest).then(function(contents) {
    debug('loaded graph from repository');
    return JSON.parse(new Buffer(contents.content, 'base64'));
  });
}

module.exports.fetchGraph = fetchGraph;

/**
Decorate the given graph object with the pull request data.

@return {Promise<Object>} graph result object.
*/
function decorateGraph(graph, treeherderProject, github, pushEvent) {
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

  debug('Fetching owner from login', committerUsername);
  return fetchOwnerFromLogin(
    github,
    committerUsername
  ).then(function(owner) {
    graph = decorate(
      graph,
      envs,
      tags,
      { owner: owner, source: '/' }
    );

    // cast to promise and fill in the rest of fields with defaults if not set...
    return Promise.cast(GraphFactory.create(graph));
  });
}

module.exports.decorateGraph = decorateGraph;


function buildGraph(github, project, pullRequest) {
  return fetchGraph(github, pullRequest).then(function(graph) {
    return decorateGraph(graph, project, github, pullRequest);
  });
}

module.exports.buildGraph = buildGraph;

