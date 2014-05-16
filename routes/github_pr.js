var Promise = require('promise');
var treeherderPulls = require('mozilla-treeherder/github').pull;
var TreeherderRepo = require('mozilla-treeherder/project');

var githubGraph = require('../graph/github_pr');
var debug = require('debug')('gaia-treeherder/github/pull_request');

module.exports = function(services) {

  return function* () {
    if (!this.request.body) {
      return this.throw(400, 'Must contain a body');
    }

    var body = this.request.body;
    var repository = body.repository;
    var pullRequest = body.pull_request;
    var action = body.action;

    if (!pullRequest) {
      return this.throw(400, 'Invalid or missing pull request data');
    }

    // closed is not a failure but we take no actions
    if (action === 'closed') {
      // XXX: consider canceling tasks?
      this.status = 200;
      return
    }

    var userName = repository.owner.login;
    var repoName = repository.name;
    var number = pullRequest.number;

    var project = yield services.projects.findByRepo(
      userName,
      repoName,
      'pull request' // XXX: 'pull request' is not a real branch but a hack
    );

    if (!project) {
      return this.throw(400, 'Cannot handle requests for this github project');
    }

    var resultset = yield treeherderPulls(project.name, {
      user: userName,
      repo: repoName,
      number: number,
      // XXX: migrate to using per project token
      token: process.env.GITHUB_OAUTH_TOKEN
    });

    resultset.revision_hash = githubGraph.pullRequestResultsetId(pullRequest);
    resultset.aggregate_id = 'pr-' + number;

    var treeherderRepo = new TreeherderRepo(project.name, {
      consumerKey: project.consumerKey,
      consumerSecret: project.consumerSecret
    });

    // post to treeherder
    yield treeherderRepo.postResultset([resultset]);

    var graph = yield githubGraph.fetchGraph(services.github, pullRequest);
    var decoratedGraph = yield githubGraph.decorateGraph(
      graph,
      project,
      services.github,
      pullRequest
    );

    // post it to the graph server
    var status = yield services.graph.createTaskGraph(decoratedGraph);
    this.status = 201;
    this.body = status;
  }
};
