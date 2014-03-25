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
  var fs = require('fs');
  var app = require('../');
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
  suiteSetup(function() {
    // setup our http server to record outgoing json responses
    server = http.createServer(recordJSON).listen(0);
    // initialize our express app code
    server.on('request', app());
    // then make it public
    return ngrokify(server).then(function(_url) {
      url = _url;
    });
  });

  // idempotent fork
  suiteSetup(function() {
    gh = new Github({ token: GH_TOKEN });
    return githubFork(gh, GH_USER, GH_REPO).then(function(_ghRepo) {
      ghRepo = _ghRepo;
    });
  });

  // add some hooks to the repository...
  var hookId;
  suiteSetup(function createHook() {
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

  suiteTeardown(function deleteHook() {
    return ghRepo.deleteHook(hookId);
  });

  suite('newly added graph', function() {
    var pr, req, res;
    suiteSetup(function() {
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
      }).then(function(_pr) {
        pr = _pr;
      });

      // wait for the server to respond
      var serverPromise =
        waitForResponse(server, '/github/pull_request', 201).
        then(function(pair) {
          req = pair[0];
          res = pair[1];
        });

      return Promise.all(prPromise, serverPromise);
    });

    suiteTeardown(function() {
      return pr.destroy();
    });

    test('graph posted to taskcluster', function() {
      var expectedGraph = require('../test/fixtures/example_graph');
      var expectedLabels = Object.keys(expectedGraph.tasks);

      var graph = res.app.get('graph');
      return graph.azureTable().then(function(creds) {
        var graphId = res.body.status.taskGraphId;
        var client = AzureTable.createClient({
          accountUrl: 'https://' + creds.accountName + '.table.core.windows.net/',
          accountName: creds.accountName,
          // yes sas must be a string here this terribleness is correct
          sas: queryString.stringify(creds.sharedSignature)
        });

        var query = Promise.denodeify(client.queryEntities.bind(client));
        return query(creds.taskGraphTable, {
          query: AzureTable.Query.create('PartitionKey', '==', graphId),
          limitTo: 20
        }).then(function(data) {
          assert.ok(data.length > 0, 'submitted graph');
          var labels = [];

          data.forEach(function(row) {
            if (row.label) labels.push(row.label);
          });

          assert.deepEqual(expectedLabels, labels);
        });
      });
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
