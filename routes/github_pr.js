var Promise = require('promise');
var treeherderPulls = require('mozilla-treeherder/github').pull;
var TreeherderRepo = require('mozilla-treeherder/project');

var GraphFactory = require('taskcluster-task-factory/graph');
var ghOwner = require('../lib/github/owner');
var prContent = require('../lib/github/pr_content');
var debug = require('debug')('gaia-treeherder/github/pull_request');
var merge = require('deap').merge;
var jsTemplate = require('json-templater/object');

module.exports = function(runtime) {
  var TASKGRAPH_PATH = runtime.taskGraphPath;

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

    console.log(JSON.stringify(pullRequest, null, 2));
    console.log('merge_sha from pr', pullRequest.mergeable);

    var userName = repository.owner.login;
    var repoName = repository.name;
    var number = pullRequest.number;
    // current commit in the pull request important for status commit api
    var commit = pullRequest.head.sha;

    var project = yield runtime.projects.findByRepo(
      userName,
      repoName,
      'pull request' // XXX: 'pull request' is not a real branch but a hack
    );

    if (!project) {
      return this.throw(400, 'Cannot handle requests for this github project');
    }

    var graph = JSON.parse(yield prContent(
      runtime.github,
      pullRequest,
      TASKGRAPH_PATH
    ));

    // owner email address note that we use who submitted the pr not who
    // authored the code originally
    var owner = yield ghOwner(runtime.github, body.sender.login);

    var source = runtimegce.github.rawUrl + '/' +
      pullRequest.head.repo.full_name + '/' +
      pullRequest.head.ref + '/' +
      TASKGRAPH_PATH;

    var params = {
      githubBranch: pullRequest.base.ref,
      githubRepo: repoName,
      githubUser: userName,
      // ensure these are always strings to avoid errors from tc
      githubPullRequest: String(number),
      githubCommit: String(commit),
      githubRef: 'refs/pull/' + number + '/merge',
      treeherderRepo: project.name
    };

    graph = jsTemplate(merge(
      // remember these values _override_ values set elsewhere
      {
        metadata: {
          owner: owner,
          source: source,
        },
      },

      // original graph from github
      graph,

      // defaults set by config.js
      runtimegce.graph
    ), params);

    graph.tasks = graph.tasks.map(function(task) {
      return merge(
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
        task,

        // defaults set by config.js
        runtimegce.task
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
      token: runtimegce.github.token
    });

    resultset.author = owner;
    resultset.aggregate_id = 'pull/' + number;
    resultset.revision_hash = commit;
    yield treeherderRepo.postResultset([resultset]);

    // finally use the factory to fill in any required fields that have
    // defaults...
    graph = GraphFactory.create(graph);
    var graphStatus = yield runtime.graph.createTaskGraph(GraphFactory.create(graph));
    this.status = 201;
    this.body = {
      taskGraphId: graphStatus.status.taskGraphId,
      treeherderProject: project.name,
      treeherderRevisionHash: commit
    };
  }
};
