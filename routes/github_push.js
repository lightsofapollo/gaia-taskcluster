var TreeherderProject = require('mozilla-treeherder/project');
var TreehederGHFactory = require('mozilla-treeherder/factory/github');
var GraphFactory = require('taskcluster-task-factory/graph');

var pushContent = require('../lib/github/push_content');
var ghOwner = require('../lib/github/owner');
var merge = require('deap').merge;
var debug = require('debug')('gaia-treeherder/github/push');

module.exports = function(services) {
  var TASKGRAPH_PATH = services.taskGraphPath;

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
    var commit = body.head_commit.id;

    var project = yield services.projects.findByRepo(
      userName,
      repoName,
      branch
    );

    // owner email address note that we use who submitted the pr not who
    // authored the code originally
    var owner = yield ghOwner(services.github, body.pusher.name);

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
      consumerSecret: project.consumerSecret
    });

    yield thRepository.postResultset([resultset]);

    var graph = JSON.parse(yield pushContent(services.github, body, TASKGRAPH_PATH));

    var source = services.config.github.rawUrl + '/' +
      repository.owner.name + '/' +
      repository.name + '/' +
      branch + '/' +
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
          githubBranch: branch,
          githubRepo: repoName,
          githubUser: userName,
          // ensure these are always strings to avoid errors from tc
          githubCommit: String(commit),
          githubRef: body.ref,
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
          metadata: {
            owner: owner,
            source: source
          },
        },

        // original task in the graph
        graph.tasks[key].task,

        // defaults set by config.js
        services.config.task
      );
    });

    graph = GraphFactory.create(graph);

    var status = yield services.graph.createTaskGraph(graph);
    this.body = {
      taskGraphId: status.status.taskGraphId,
      treeherderProject: project.name,
      treeherderRevisionHash: commit
    };
    this.status = 201;
  };
};
