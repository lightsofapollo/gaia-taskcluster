suite('github', function() {
  var co = require('co');
  var github = require('octokit').new();
  var subject = require('./github_login');

  test('email address', co(function* () {
    require('../test/nock/github_user_email')();
    var login = 'lightsofapollo';
    var email = yield subject(github, login);
    assert.ok(email, 'has email');
    assert.ok(
      email.indexOf('taskcluster.net') === -1, 'is not a generated email'
    );
  }));

  test('no email address', co(function * () {
    require('../test/nock/github_user_no_email')();
    var login = 'lightsofapollo-staging';
    var email = yield subject(github, login);
    assert.equal(login + '@github.taskcluster.net', email);
  }));

});
