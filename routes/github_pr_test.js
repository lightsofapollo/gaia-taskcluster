suite('POST /github - pull request events', function() {
  this.timeout('100s');

  // github target repository...
  var GH_USER = 'taskcluster';
  var GH_REPO = 'github-graph-example';
  var GH_TOKEN = process.env.GITHUB_OAUTH_TOKEN;

  var TreeherderProject = require('mozilla-treeherder/project');
  var AzureTable = require('azure-table-node');
  var Github = require('github-api');

  var fs = require('fs');
  var co = require('co');
  var appFactory = require('../');
  var ngrokify = require('ngrok-my-server');
  var githubPr = require('testing-github/pullrequest');
  var githubFork = require('testing-github/fork');
  var githubGraph = require('../graph/github_pr');
  var gh; // generic github-api interface
  var ghRepo; // github repository interface

  if (!GH_TOKEN) {
    test.skip(
      'This suite is a full integration test and requires GITHUB_OAUTH_TOKEN'
    );
    return;
  }
  // start server and expose a public ip address...
  var url;
  var server;
  var app;
  suiteSetup(co(function*() {
    app = appFactory();
    app.middleware.unshift(require('../test/koa_record')(app));

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
    var baseProject = yield app.services.projects.findByRepo(
      GH_USER,
      GH_REPO
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

    yield app.services.projects.add(project);
  }));

  suiteTeardown(function deleteHook() {
    return ghRepo.deleteHook(hookId);
  });

  suite('newly added graph', function() {
    var pr, ctx;

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
          content: fs.readFileSync(
            __dirname + '/../test/fixtures/example_graph.json',
            'utf8'
          )
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
      var expectedGraph = require('../test/fixtures/example_graph');
      var expectedLabels = Object.keys(expectedGraph.tasks);

      var graph = app.services.graph;
      var graphId = ctx.body.status.taskGraphId;

      var graphStatus = yield graph.inspectTaskGraph(graphId);
      var taskLabels = Object.keys(graphStatus.tasks);

      assert.deepEqual(expectedLabels, taskLabels);
    }));

    test('project creates resultset', co(function* () {
      var revHash = githubGraph.pullRequestResultsetId(ctx.request.body.pull_request);

      // XXX: Replace with some test/project constants?
      var project = new TreeherderProject('taskcluster-integration');

      var res = yield project.getResultset();
      var item = res.results.some(function(item) {
        // calculated revision hash based on the pull request is a
        // match
        return item.revision_hash == revHash;
      });
      assert.ok(item, 'posts resulsts to treeherder');
    }));
  });

});
