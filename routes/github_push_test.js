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

  var nock = require('nock');
  var uuid = require('uuid');
  var fs = require('fs');
  var appFactory = require('../');
  var ngrokify = require('ngrok-my-server');
  var recordJSON = require('../test/response_body_recorder');
  var waitForResponse = require('../test/wait_for_response');
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
  var http = require('http');
  var url;
  var server;
  var app;
  suiteSetup(function() {
    app = appFactory();
    // setup our http server to record outgoing json responses
    server = http.createServer(recordJSON).listen(0);
    // initialize our express app code
    server.on('request', app);
    // then make it public
    return ngrokify(server).then(function(_url) {
      url = _url;
    });
  });

  // idempotent fork
  suiteSetup(function() {
    gh = new Github({ token: GH_TOKEN });
    ghRepo = gh.getRepo(GH_USER, GH_REPO);
    return githubFork(gh, GH_USER, GH_REPO).then(function(_ghRepo) {
      ghRepo = _ghRepo;
    });
  });

  // create a branch
  var branch = 'branch-' + uuid.v4();
  suiteSetup(function() {
    return ghRepo.branch('plain', branch);
  });

  // create a project for this test
  var project;
  suiteSetup(function() {
    return ghRepo.show().then(function(info) {
      return app.get('projects').findByRepo(
        info.owner.login,
        info.name,
        'pull request'
      );
    }).then(function(baseProject) {
      assert(baseProject, 'has base configuration for tests');
      project = {};
      for (var key in baseProject) project[key] = baseProject[key];
      baseProject.branch = branch;
      return app.get('projects').add(baseProject);
    });
  });

  // add some hooks to the repository...
  var hookId;
  suiteSetup(function createHook() {
    // XXX: This should be part of the overall application rather then
    // hardcoded.
    return ghRepo.createHook({
      name: 'web',
      events: ['push'],
      config: {
        // XXX: We ideally should just have one single github entrypoint.
        url: url + '/github',
        content_type: 'json'
      }
    }).then(function(result) {
      hookId = result.id;
    });
  });

  suiteTeardown(function deleteHook() {
    return ghRepo.deleteHook(hookId);
  });

  suite('push with graph', function() {
    var pr, req, res;
    var fixturePath =
      __dirname + '/../test/fixtures/example_graph.json';

    suiteSetup(function() {
      var createFile = Promise.denodeify(app.get('github').repos.createFile);

      var pushPromise = createFile({
        user: 'lightsofapollo-staging',
        repo: GH_REPO,
        path: 'taskgraph.json',
        message: 'testing real pushes to repos',
        content: fs.readFileSync(fixturePath, 'base64'),
        branch: branch
      });

      // wait for the server to respond
      var serverPromise =
        waitForResponse(server, '/github', 201).
        then(function(pair) {
          req = pair[0];
          res = pair[1];
        });

      return Promise.all(pushPromise, serverPromise);
    });

    suiteTeardown(function() {
      return ghRepo.deleteRef('heads/' + branch);
    });

    test('graph posted to taskcluster', function(){
      console.log(res.body)
      console.log(res.body.before, res.body.after);
    });

    test('project creates resultset', function() {
    });
  });
});

