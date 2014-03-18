suite('github_tasks', function() {
  var subject = require('./github_pr');
  var PullRequest = require('github-fixtures/pull_request');

  suite('build single task', function() {
    var pr = PullRequest.create();

    // XXX: This should test the in tree configuration test case when it exists.
    test('tasks', function() {
      return subject({}, pr).then(function(result) {
        assert.ok(result.tasks);
      });
    });
  });
});

