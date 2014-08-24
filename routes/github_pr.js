var Promise = require('promise');
var treeherderPulls = require('mozilla-treeherder/github').pull;
var TreeherderRepo = require('mozilla-treeherder/project');

var GraphFactory = require('taskcluster-task-factory/graph');
var ghOwner = require('../lib/github/owner');
var prContent = require('../lib/github/pr_content');
var debug = require('debug')('gaia-treeherder/github/pull_request');
var merge = require('deap').merge;
var jsTemplate = require('json-templater/object');
var slugid = require('slugid');

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
      runtime.githubApi,
      pullRequest,
      TASKGRAPH_PATH
    ));

    runtime.log('fetched graph', { graph: graph, pullRequest: pullRequest });

    // owner email address note that we use who submitted the pr not who
    // authored the code originally
    var owner = yield ghOwner(runtime.githubApi, body.sender.login);

    var source = runtime.github.rawUrl + '/' +
      pullRequest.head.repo.full_name + '/' +
      pullRequest.head.ref + '/' +
      TASKGRAPH_PATH;

    var params = {
      branch: pullRequest.base.ref,
      githubRepo: repoName,
      githubUser: userName,
      // ensure these are always strings to avoid errors from tc
      githubPullRequest: String(number),
      commit: String(commit),
      commitRef: 'refs/pull/' + number + '/merge',
      treeherderRepo: project.name
    };

    graph = merge(
      // remember these values _override_ values set elsewhere
      {
        scopes: project.graphScopes,
        metadata: {
          owner: owner,
          source: source,
        },
      },

      // original graph from github
      graph,

      // defaults set by config.js
      runtime.graph
    );

    graph.tasks = graph.tasks.map(function(task) {
      var out = merge(
        // strict overrides
        {
          task: {
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
          }
        },

        // original task in the graph
        task,

        // defaults set by config.js
        { task: runtime.task }
      );
      return out;
    });

    graph = GraphFactory.create(jsTemplate(graph, params));
    var createdTasks = graph.tasks.map(function(task) {
      return task.taskId;
    });

    var treeherderRepo = new TreeherderRepo(project.name, {
      consumerKey: project.consumerKey,
      consumerSecret: project.consumerSecret,
      baseUrl: runtime.treeherder.baseUrl
    });

    // build the treeherder resultset
    var resultset = yield treeherderPulls(project.name, {
      user: userName,
      repo: repoName,
      number: number,
      token: runtime.github.token
    });

    resultset.author = owner;
    resultset.aggregate_id = 'pull/' + number;
    resultset.revision_hash = commit;
    yield treeherderRepo.postResultset([resultset]);

    // finally use the factory to fill in any required fields that have
    // defaults...
    var id = slugid.v4();
    runtime.log('create graph', { id: id, graph: graph });

    try {
      var graphStatus =
        yield runtime.scheduler.createTaskGraph(id, graph);
    } catch (e) {
      // TODO: Handle graph syntax errors and report them to github.
      runtime.log('create task graph error', {
        message: e.message,
        body: e.body
      });
      throw e;
    }

    this.status = 201;
    this.body = {
      taskGraphId: id,
      taskIds: createdTasks,
      treeherderProject: project.name,
      treeherderRevisionHash: commit
    };
  }
};
