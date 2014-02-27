suite('REST /github/pull_request', function() {
  var TreeherderProject = require('mozilla-treeherder/project');
  var request = require('supertest');
  var app = require('../')();
  var nock = require('nock');

  suite('POST - submitting results to treeherder', function() {
    // actual github pull request event taken from the webhook UI
    var fixture = require('../test/fixtures/github_pull_request.json');

    setup(function(done) {
      require('../test/nock/gaia_pull_request_success')
      request(app).
        post('/github/pull_request').
        send(fixture).
        expect(200).
        end(done);
    });

    test('project creates resultset', function() {
      var project = new TreeherderProject('gaia');
      return project.getResultset().then(function(list) {
        var item = list.some(function(item) {
          return item.revision_hash == fixture.pull_request.html_url;
        });
        assert.ok(item, 'posts resulsts to treeherder');
      });
    });
  });
});
