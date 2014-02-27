suite('github', function() {
  var REPO = 'gaia';

  var GithubCommits = require('github-fixtures/commit');
  var PullRequest = require('github-fixtures/pull_request');
  var subject = require('./github');

  function commitToRev(record) {
    var author = record.commit.author;
    return {
      comment: record.commit.message,
      revision: record.sha,
      repository: REPO,
      author: author.name + ' <' + author.email + '>'
    };
  }

  suite('#pull', function() {
    var pr = PullRequest.create();

    test('pull request', function() {
      var result = subject.pull(REPO, pr);
      assert.deepEqual(result, {
        revision_hash: pr.html_url,
        // created at in seconds
        push_timestamp: (new Date(pr.created_at)).valueOf() / 1000,
        type: 'push'
      });
    });
  });

  suite('#commits', function() {
    var commits = [
      GithubCommits.create(),
      GithubCommits.create()
    ];

    var expected = commits.map(commitToRev);

    test('multiple commits', function() {
      assert.deepEqual(
        subject.commits(REPO, commits),
        expected
      );
    });
  });
});
