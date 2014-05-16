suite('github', function() {
  this.timeout('100s');

  var Promise = require('promise');
  var PromiseProxy = require('proxied-promise-object');
  var TreeherderProject = require('mozilla-treeherder/project');

  // github target repository...
  var GH_USER = 'taskcluster';
  var GH_REPO = 'github-graph-example';
  var GH_TOKEN = process.env.GITHUB_OAUTH_TOKEN;

  var AzureTable = require('azure-table-node');
  var Github = require('github-api');

  var co = require('co');
  var uuid = require('uuid');
  var fs = require('fs');
  var appFactory = require('../');
  var ngrokify = require('ngrok-my-server');
  var githubPr = require('testing-github/pullrequest');
  var githubFork = require('testing-github/fork');
  var githubGraph = require('../graph/github_pr');
  var queryString = require('querystring');
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

  // create a branch
  var branch = 'branch-' + uuid.v4();
  suiteSetup(function() {
    return ghRepo.branch('plain', branch);
  });

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
    project.branch = branch;
    project.user = forkedUser;
    project.repo = forkedRepo;

    yield app.services.projects.add(project);
  }));

  // add some hooks to the repository...
  var hookId;
  suiteSetup(co(function* () {
    // XXX: This should be part of the overall application rather then
    // hardcoded.
    var hook = yield ghRepo.createHook({
      name: 'web',
      events: ['push'],
      config: {
        // XXX: We ideally should just have one single github entrypoint.
        url: url + '/github',
        content_type: 'json'
      }
    });
    hookId = hook.id;
  }));

  suiteTeardown(function deleteHook() {
    return ghRepo.deleteHook(hookId);
  });

  suite('push with graph', function() {
    var fixturePath =
      __dirname + '/../test/fixtures/example_graph.json';

    var ctx;
    suiteSetup(co(function*() {
      var github = app.services.github;

      // figure out which repository to push to
      var user = yield github.getUser().getInfo();
      var gitBranch = github.getRepo(user.login, GH_REPO).getBranch(branch);
      // write some content to the graph graph to trigger a "push" event
      yield gitBranch.write('taskgraph.json', fs.readFileSync(fixturePath, 'utf8'))

      // wait for the server to respond
      ctx = yield app.waitForResponse('/github', 201);
    }));

    suiteTeardown(function() {
      return ghRepo.deleteRef('heads/' + branch);
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

    test('project creates resultset', co(function*() {
      var revHash = ctx.request.body.head_commit.id;

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

