suite('github - push test', function() {
  this.timeout('200s');

  var TreeherderProject = require('mozilla-treeherder/project');
  var Github = require('github-api');

  var returnField = require('./helper/return_field');
  var fs = require('fs');
  var co = require('co');
  var uuid = require('uuid');
  var appFactory = require('../../lib/app');
  var config = require('../../config/test');
  var ngrokify = require('ngrok-my-server');
  var githubPr = require('testing-github/pullrequest');
  var githubFork = require('testing-github/fork');
  var gh; // generic github-api interface
  var ghRepo; // github repository interface

  // Treeherder project...
  var thProject = new TreeherderProject('taskcluster-integration', {
    baseUrl: config.treeherder.baseUrl
  });

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
  suiteSetup(co(function*() {
    app = yield appFactory(config);
    app.middleware.unshift(require('./helper/koa_record')(app));

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
  suiteSetup(co(function* () {
    yield ghRepo.branch('plain', branch);
  }));

  // create a project for this test
  var project;
  suiteSetup(co(function*() {
    // find the global test project for taskcluster
    var baseProject = yield app.runtime.projects.findByRepo(
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

    yield app.runtime.projects.add(project);
  }));

  // add some hooks to the repository...
  var hookId;
  suiteSetup(co(function* () {
    // XXX: This should be part of the overall application rather then
    // hardcoded.
    try {
      var hook = yield ghRepo.createHook({
        name: 'web',
        events: ['push'],
        config: {
          // XXX: We ideally should just have one single github entrypoint.
          url: url + '/github',
          content_type: 'json'
        }
      });
    } catch (e) {
      throw e;

    }
    hookId = hook.id;
  }));

  suiteTeardown(function deleteHook() {
    return ghRepo.deleteHook(hookId);
  });

  suite('push with graph', function() {
    var fixturePath =
      __dirname + '/../fixtures/example_graph.json';

    var ctx;
    suiteSetup(co(function*() {
      var github = app.runtime.githubApi;

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
      var expectedTaskIds = ctx.body.taskIds;

      var graph = app.runtime.scheduler;
      var graphId = ctx.body.taskGraphId;

      var graphStatus = yield graph.inspect(graphId);
      var taskIds = graphStatus.tasks.map(returnField('taskId'))

      assert.deepEqual(expectedTaskIds, taskIds);
    }));

    test('project creates resultset', co(function*() {
      var revHash = ctx.request.body.head_commit.id;

      var res = yield thProject.getResultset();
      var item = res.results.some(function(item) {
        // calculated revision hash based on the pull request is a
        // match
        return item.revision_hash == revHash;
      });

      assert.ok(item, 'posts resulsts to treeherder');
    }));
  });
});

