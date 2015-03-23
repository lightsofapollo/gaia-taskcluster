suite('POST /github - pull request events', function() {
  this.timeout('200s');

  var TreeherderProject = require('mozilla-treeherder/project');
  var Github = require('github-api');

  var returnField = require('./helper/return_field');
  var fs = require('fs');
  var co = require('co');
  var appFactory = require('../../lib/app');
  var config = require('../../config/test');
  var ngrokify = require('ngrok-my-server');
  var githubPr = require('testing-github/pullrequest');
  var githubFork = require('testing-github/fork');
  var gh; // generic github-api interface
  var ghRepo; // github repository interface

  if (!config.githubTest.token) {
    test.skip(
      'This suite is a full integration test and requires GH_TESTING_TOKEN'
    );
    return;
  }

  // github target repository...
  var GH_USER = 'taskcluster';
  var GH_REPO = 'github-graph-example';
  var GH_TOKEN = config.githubTest.token;

  // start server and expose a public ip address...
  var url;
  var server;
  var app;
  var thProject;
  suiteSetup(co(function*() {
    app = yield appFactory(config);
    app.middleware.unshift(require('./helper/koa_record')(app));

    thProject = new TreeherderProject('taskcluster-integration', {
      baseUrl: app.runtime.treeherder.baseUrl
    });

    server = app.listen(0);
    // then make it public
    url = yield ngrokify(server);
  }));

  // idempotent fork
  suiteSetup(co(function* () {
    gh = new Github({ token: GH_TOKEN });
    ghRepo = yield githubFork(gh, GH_USER, GH_REPO);
  }));

  // add some hooks to the repository...
  var hookId;
  suiteSetup(co(function* () {
    // XXX: This should be part of the overall application rather then
    // hardcoded.
    var hook = yield ghRepo.createHook({
      name: 'web',
      events: ['pull_request'],
      config: {
        // XXX: We ideally should just have one single github entrypoint.
        url: url + '/github',
        content_type: 'json'
      }
    });
    hookId = hook.id;
  }));

  // create a project for this test
  var project;
  suiteSetup(co(function*() {
    // find the global test project for taskcluster
    var baseProject = yield app.runtime.projects.findByRepo(
      GH_USER,
      GH_REPO,
      'master'
    );

    assert(baseProject, 'base project is required');

    // create a new project just for this test and add it to the project state

    // get details for the forked repository
    var forkedDetails = yield ghRepo.show();
    var forkedUser = forkedDetails.owner.login;
    var forkedRepo = forkedDetails.name;

    project = {};
    for (var key in baseProject) project[key] = baseProject[key];
    // override the specifics for our new project
    project.branch = 'pull request';
    project.user = forkedUser;
    project.repo = forkedRepo;

    yield app.runtime.projects.add(project);
  }));

  suiteTeardown(function deleteHook() {
    return ghRepo.deleteHook(hookId);
  });

 suite('newly added graph', function() {
    var pr, ctx;
    var graphFixture = require('../fixtures/example_graph');

    suiteSetup(co(function*() {
      // issue the pull request
      var prPromise = githubPr(GH_TOKEN, {
        repo: GH_REPO,
        user: GH_USER,
        title: 'Testing a pull request',
        body: 'pr test',
        branch: 'plain',
        files: [{
          commit: 'graph',
          path: 'taskgraph.json',
          content: JSON.stringify(graphFixture)
        }]
      });

      // wait for the server to respond
      pr = yield prPromise;
      ctx = yield app.waitForResponse('/github', 201);
    }));

    suiteTeardown(function() {
      return pr.destroy();
    });

    test('graph posted to taskcluster', co(function * () {
      var expectedIds = ctx.body.taskIds;
      var graph = app.runtime.scheduler;
      var graphId = ctx.body.taskGraphId;

      var graphStatus = yield graph.inspect(graphId);
      var taskIds = graphStatus.tasks.map(returnField('taskId'));
      assert.deepEqual(expectedIds, taskIds);
    }));

    test('project creates resultset', co(function* () {
      // XXX: Replace with some test/project constants?
      var revHash = ctx.body.treeherderRevisionHash;

      var res = yield thProject.getResultset();
      var items = res.results.filter(function(item) {
        // calculated revision hash based on the pull request is a
        // match
        return item.revision_hash == revHash;
      });

      var resultset = items.shift();

      assert.ok(resultset, 'posts resulsts to treeherder');
      assert.ok(resultset.author.indexOf(GH_USER) !== -1, 'has author');
    }));

    suite('updated graph', function() {
      var graphFixture = require('../fixtures/xfoo_graph.json');
      suiteSetup(co(function*() {
        // update the task graph
        var commit = yield pr.fork.write(
          pr.forkBranch,
          'taskgraph.json',
          JSON.stringify(graphFixture),
          'update graph'
        );

        // get the latest commit
        ctx = yield app.waitForResponse('/github', 201);
      }));

      test('updated project resultsets', co(function* () {
        // XXX: Replace with some test/project constants?
        var revHash = ctx.body.treeherderRevisionHash;

        var res = yield thProject.getResultset();
        var items = res.results.filter(function(item) {
          // calculated revision hash based on the pull request is a
          // match
          return item.revision_hash == revHash;
        });

        var resultset = items.shift();

        assert.ok(resultset, 'posts resulsts to treeherder');
        assert.ok(resultset.author.indexOf(GH_USER) !== -1, 'has author');
      }));

      test('graph posted to taskcluster', co(function * () {
        var expectedTaskIds = ctx.body.taskIds;
        var graph = app.runtime.scheduler;
        var graphId = ctx.body.taskGraphId;

        var graphStatus = yield graph.inspect(graphId);
        var taskIds = graphStatus.tasks.map(returnField('taskId'))
        assert.deepEqual(expectedTaskIds, taskIds);
      }));

    });
  });

  suite('head has no graph base base does', function() {
    var pr, ctx;
    var graphFixture = require('../fixtures/example_graph');

    suiteSetup(co(function*() {
      // issue the pull request
      var prPromise = githubPr(GH_TOKEN, {
        repo: GH_REPO,
        user: GH_USER,
        title: 'Testing a pull request',
        body: 'pr test',
        branch: 'clean',  // pull request starts at plain
        baseBranch: 'pr', // but targets the pr branch which has a graph
        files: [{
          commit: 'plain commit',
          path: 'a.txt',
          content: 'a.txt'
        }]
      });

      try {
        // wait for the server to respond
        pr = yield prPromise;
        ctx = yield app.waitForResponse('/github', 201);
      } catch (e) {
        console.log('Error creating commits!');
        console.log(e);
        throw e;
      }
    }));

    suiteTeardown(function() {
      return pr.destroy();
    });

    test('graph posted to taskcluster', co(function * () {
      var expectedIds = ctx.body.taskIds;
      var graph = app.runtime.scheduler;
      var graphId = ctx.body.taskGraphId;

      var graphStatus = yield graph.inspect(graphId);
      var taskIds = graphStatus.tasks.map(returnField('taskId'));
      assert.deepEqual(expectedIds, taskIds);
    }));

    test('project creates resultset', co(function* () {
      // XXX: Replace with some test/project constants?
      var revHash = ctx.body.treeherderRevisionHash;

      var res = yield thProject.getResultset();
      var items = res.results.filter(function(item) {
        // calculated revision hash based on the pull request is a
        // match
        return item.revision_hash == revHash;
      });

      var resultset = items.shift();

      assert.ok(resultset, 'posts resulsts to treeherder');
      assert.ok(resultset.author.indexOf(GH_USER) !== -1, 'has author');
    }));
  });
});
