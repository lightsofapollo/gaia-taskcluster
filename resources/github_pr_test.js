suite('github', function() {
  var Promise = require('promise');
  var PromiseProxy = require('proxied-promise-object');
  var TreeherderProject = require('mozilla-treeherder/project');

  // github target repository...
  var GH_USER = 'taskcluster';
  var GH_REPO = 'github-graph-example';
  var GH_TOKEN =
    process.env.GH_TESTING_TOKEN || process.env.GITHUB_OAUTH_TOKEN;

  var Github = require('github-api');

  var app = require('../');
  var ngrokify = require('ngrok-my-server');
  var githubPr = require('testing-github/pullrequest');
  var githubGraph = require('../graph/github_pr');
  var gh; // generic github-api interface
  var ghRepo; // github repository interface

  suiteSetup(function() {
    assert(GH_TOKEN, 'github token is required');
    gh = new Github({ token: GH_TOKEN });
    ghRepo = PromiseProxy(Promise, gh.getRepo(GH_USER, GH_REPO));
  });

  // start server and expose a public ip address...
  var url;
  var server;
  suiteSetup(function() {
    server = app().listen(0);

    return ngrokify(server).then(function(_url) {
      url = _url;
    });
  });

  /**
  XXX: This should be it's own module

  @param {String} path for the incoming http request.
  @param {Number} status to wait for.
  @return Promise<Array[HttpRequest,HttpResponse]>
  */
  function waitForServerResponse(server, path, status) {
    return new Promise(function(accept, reject) {
      function request(req, res) {
        console.log(req.path, path);
        if (req.path !== path) return;
        res.once('finish', response.bind(this, req, res));
      }

      function response(req, res) {
        if (res.statusCode == status) {
          // the promise can only resolve once but be a good person...
          server.removeListener('request', request);
          accept([req, res]);
        }
      }

      server.on('request', request);
    });
  }

  // add some hooks to the repository...
  var hookId;
  suiteSetup(function() {
    // XXX: This should be part of the overall application rather then
    // hardcoded.
    return ghRepo.createHook({
      name: 'web',
      events: ['pull_request'],
      config: {
        // XXX: We ideally should just have one single github entrypoint.
        url: url + '/github/pull_request',
        content_type: 'json'
      }
    }).then(function(result) {
      hookId = result.id;
    });
  });

  suiteTeardown(function() {
    return ghRepo.deleteHook(hookId);
  });

  suite('successfully issue a pull request with a graph', function() {
    var pr, req, res;
    suiteSetup(function() {
      // issue the pull request
      var prPromise = githubPr(GH_TOKEN, {
        repo: GH_REPO,
        user: GH_USER,
        title: 'Testing a pull request',
        body: 'pr test',
        files: [{ commit: 'woot', path: 'file.txt', content: 'yay' }]
      }).then(function(_pr) {
        console.log('resolve');
        pr = _pr;
      });

      // wait for the server to respond
      var serverPromise =
        waitForServerResponse(server, '/github/pull_request', 201).
        then(function(pair) {
          console.log('resolve 2');
          req = pair[0];
          res = pair[1];
        });

      return Promise.all(prPromise, serverPromise);
    });

    suiteTeardown(function() {
      return pr.destroy();
    });

    test('project creates resultset', function() {
      var revHash = githubGraph.pullRequestResultsetId(req.body.pull_request);

      // XXX: Replace with some test/project constants?
      var project = new TreeherderProject('taskcluster-integration');

      return project.getResultset().then(function(list) {
        var item = list.some(function(item) {
          // calculated revision hash based on the pull request is a
          // match
          return item.revision_hash == revHash;
        });
        assert.ok(item, 'posts resulsts to treeherder');
      });
    });
  });
});
