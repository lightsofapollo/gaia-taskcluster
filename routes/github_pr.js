var Promise = require('promise');
var treeherderPulls = require('mozilla-treeherder/github').pull;
var TreeherderRepo = require('mozilla-treeherder/project');

var GraphFactory = require('taskcluster-task-factory/graph');
var ghOwner = require('../github/owner');
var prContent = require('../github/pr_content');
var debug = require('debug')('gaia-treeherder/github/pull_request');
var merge = require('deap').merge;

module.exports = function(services) {

  var TASKGRAPH_PATH = services.config.taskGraphPath;

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
    // current commit in the pull request important for status commit api
    var commit = pullRequest.head.sha;

    var project = yield services.projects.findByRepo(
      userName,
      repoName,
      'pull request' // XXX: 'pull request' is not a real branch but a hack
    );

    if (!project) {
      return this.throw(400, 'Cannot handle requests for this github project');
    }

    var graph = JSON.parse(yield prContent(
      services.github,
      pullRequest,
      TASKGRAPH_PATH
    ));

    // owner email address note that we use who submitted the pr not who
    // authored the code originally
    var owner = yield ghOwner(services.github, body.sender.login);

    var source = services.config.github.rawUrl + '/' +
      pullRequest.head.repo.full_name + '/' +
      pullRequest.head.ref + '/' +
      TASKGRAPH_PATH;

    graph = merge(
      // remember these values _override_ values set elsewhere
      {
        metadata: {
          owner: owner,
          source: source,
        },
        // we attempt to limit the amount of graph configuration here but many
        // defaults are set in config.js
        params: {
          githubBranch: pullRequest.base.ref,
          githubRepo: repoName,
          githubUser: userName,
          // ensure these are always strings to avoid errors from tc
          githubPullRequest: String(number),
          githubCommit: String(commit),
          githubRef: 'refs/pull/' + number + '/merge',
          treeherderRepo: project.name
        }
      },

      // original graph from github
      graph,

      // defaults set by config.js
      services.config.graph
    );

    Object.keys(graph.tasks).forEach(function(key) {
      graph.tasks[key].task = merge(
        // strict overrides
        {
          tags: { githubPullRequest: String(number) },
          metadata: {
            owner: owner,
            source: source
          },
          payload: {
            env: {
              GH_PULL_NUMBER: number
            }
          }
        },

        // original task in the graph
        graph.tasks[key].task,

        // defaults set by config.js
        services.config.task
      );
    });

    var treeherderRepo = new TreeherderRepo(project.name, {
      consumerKey: project.consumerKey,
      consumerSecret: project.consumerSecret
    });

    // build the treeherder resultset
    var resultset = yield treeherderPulls(project.name, {
      user: userName,
      repo: repoName,
      number: number,
      token: services.config.github.token
    });

    resultset.author = owner;
    resultset.aggregate_id = 'pull/' + number;
    resultset.revision_hash = commit;
    yield treeherderRepo.postResultset([resultset]);

    // finally use the factory to fill in any required fields that have
    // defaults...
    graph = GraphFactory.create(graph);
    var graphStatus = yield services.graph.createTaskGraph(GraphFactory.create(graph));
    this.status = 201;
    this.body = {
      taskGraphId: graphStatus.status.taskGraphId,
      treeherderProject: project.name,
      treeherderRevisionHash: commit
    };
  }
};
