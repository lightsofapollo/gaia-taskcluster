suite('REST /github/pull_request', function() {
  var TreeherderProject = require('mozilla-treeherder/project');
  var request = require('supertest');
  var app = require('../')();
  var nock = require('nock');

  suite('POST - submitting results to treeherder', function() {
    // actual github pull request event taken from the webhook UI
    var fixture = require('../test/fixtures/github_pull_request.json');
    var responseBody;

    setup(function(done) {
      require('../test/nock/gaia_pull_request_success');
      require('../test/nock/taskcluster_post_task');

      request(app).
        post('/github/pull_request').
        send(fixture).
        expect(200).
        end(function(err, res) {
          responseBody = res.body;
          done(res.error || err);
        });
    });

    test('project creates resultset', function() {
      var project = new TreeherderProject('gaia');
      assert.ok(responseBody.taskIds, 'returns taskIds in response');
      assert.ok(responseBody.taskIds[0], 'has task id');

      return project.getResultset().then(function(list) {
        var item = list.some(function(item) {
          return item.revision_hash == fixture.pull_request.html_url;
        });
        assert.ok(item, 'posts resulsts to treeherder');
      });
    });
  });
});
