suite('github_tasks', function() {
  var subject = require('./github_pr');
  var PullRequest = require('github-fixtures/pull_request');

  suite('build single task', function() {
    var pr = PullRequest.create();
    var config = require('../task_config')();

    test('tasks', function() {
      return subject({}, pr).then(function(result) {
        assert.ok(Array.isArray(result));

        var task = result[0];
        assert.equal(
          task.tags.treeeherderResultset,
          pr.html_url
        );
      });
    });
  });
});

