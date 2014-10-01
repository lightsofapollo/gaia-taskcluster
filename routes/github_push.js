var TreeherderProject = require('mozilla-treeherder/project');
var TreehederGHFactory = require('mozilla-treeherder/factory/github');
var GraphFactory = require('taskcluster-task-factory/graph');

var pushContent = require('../lib/github/push_content');
var ghOwner = require('../lib/github/owner');
var merge = require('deap').merge;
var debug = require('debug')('gaia-treeherder/github/push');
var jsTemplate = require('json-templater/object');
var slugid = require('slugid');

module.exports = function(runtime) {
  var TASKGRAPH_PATH = runtime.taskGraphPath;

  return function* () {
    var body = this.request.body;
    if (!body) this.throw(400, 'Invalid push format');

    var repository = body.repository;
    var branch = body.ref.split('/').pop();

    if (!repository || !branch) {
      return this.throw(400, 'Invalid push format missing branch or repository');
    }

    // we get push notifications for branches, etc.. we only care about incoming
    // commits with new data.
    if (!body.commits || !body.commits.length) {
      this.status = 200;
      this.body = { message: 'No commits to take action on'  }
      return;
    }

    var userName = repository.owner.name;
    var repoName = repository.name;
    var commit = String(body.head_commit.id);

    var project = yield runtime.projects.findByRepo(
      userName,
      repoName,
      branch
    );

    // owner email address note that we use who submitted the pr not who
    // authored the code originally
    var owner = yield ghOwner(runtime.githubApi, body.pusher.name);

    if (!project) {
      return this.throw(400, 'Cannot handle requests for this github project');
    }

    var resultset = {
      revision_hash: commit,
      type: 'push',
      author: owner,
      revisions: TreehederGHFactory.pushCommits(project.name, body.commits),
      push_timestamp: (new Date(body.head_commit.timestamp).valueOf()) / 1000
    };

    // submit the resultset to treeherder
    var thRepository = new TreeherderProject(project.name, {
      consumerKey: project.consumerKey,
      consumerSecret: project.consumerSecret,
      baseUrl: runtime.treeherder.baseUrl
    });

    yield thRepository.postResultset([resultset]);

    var graph = JSON.parse(
      yield pushContent(runtime.githubApi, body, TASKGRAPH_PATH)
    );

    runtime.log('fetched graph', { graph: graph, push: body });

    var source = runtime.github.rawUrl + '/' +
      repository.owner.name + '/' +
      repository.name + '/' +
      branch + '/' +
      TASKGRAPH_PATH;

    var params = {
      // Base repository details...
      githubBaseRepo: repository.name,
      githubBaseUser: repository.owner.name,
      githubBaseRevision: commit,
      githubBaseBranch: branch,

      // Head repository details are the same as base for push.
      githubHeadRepo: repository.name,
      githubHeadUser: repository.owner.name,
      githubHeadRevision: commit,
      githubHeadBranch: branch,

      // Treeherder details...
      treeherderRepo: project.name
    }

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
      var task = merge(
        // strict overrides
        {
          task: {
            metadata: {
              owner: owner,
              source: source
            },
          }
        },

        // original task in the graph
        task,

        // defaults set by config.js
        { task: runtime.task }
      );

      task.task.routes = task.task.routes || [];
      task.task.scopes = task.task.scopes || [];

      // Gaia scopes.
      task.task.routes.push(runtime.route);
      task.task.scopes.push('queue:route:' + runtime.route);

      // Treeherder
      var treeherderRoute = runtime.taskclusterTreeherder.route + '.' +
                            project.name + '.' +
                            commit;

      task.task.routes.push(treeherderRoute);
      task.task.scopes.push(treeherderRoute);

      return task;
    });

    graph = GraphFactory.create(jsTemplate(graph, params));
    var createdTasks = graph.tasks.map(function(task) {
      return task.taskId;
    });

    var id = slugid.v4();
    runtime.log('create graph', { id: id, graph: graph });

    var graphStatus =
      yield runtime.scheduler.createTaskGraph(id, graph);

    this.body = {
      taskGraphId: id,
      taskIds: createdTasks,
      treeherderProject: project.name,
      treeherderRevisionHash: commit
    };
    this.status = 201;
  };
};
