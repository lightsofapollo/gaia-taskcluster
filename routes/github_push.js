var TreeherderProject = require('mozilla-treeherder/project');
var TreehederGHFactory = require('mozilla-treeherder/factory/github');

var githubGraph = require('../graph/github_push');
var debug = require('debug')('gaia-treeherder/github/push');


module.exports = function(services) {

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

    var project = yield services.projects.findByRepo(
      userName,
      repoName,
      branch
    );

    if (!project) {
      return this.throw(400, 'Cannot handle requests for this github project');
    }

    var resultset = {
      revision_hash: body.head_commit.id,
      type: 'push',
      revisions: TreehederGHFactory.pushCommits(project.name, body.commits),
      push_timestamp: (new Date(body.head_commit.timestamp).valueOf()) / 1000
    };

    // submit the resultset to treeherder
    var thRepository = new TreeherderProject(project.name, {
      consumerKey: project.consumerKey,
      consumerSecret: project.consumerSecret
    });

    yield thRepository.postResultset([resultset]);

    var graph = yield githubGraph.fetchGraph(services.github, body);
    var decoratedGraph = yield githubGraph.decorateGraph(
      graph,
      thRepository,
      services.github,
      body
    );

    var status = yield services.graph.createTaskGraph(decoratedGraph);
    this.body = status;
    this.status = 201;
  };

};
