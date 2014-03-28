suite('github', function() {
  var Github = require('github');
  var github = new Github({
    version: '3.0.0',
  });

  var subject = require('./github_login');

  test('email address', function() {
    require('../test/nock/github_user_email')();
    var login = 'lightsofapollo';
    return subject(
      github,
      login
    ).then(function(email) {
      assert.ok(email, 'has email');
      assert.ok(
        email.indexOf('taskcluster.net') === -1, 'is not a generated email'
      );
    });
  });

  test('no email address', function() {
    require('../test/nock/github_user_no_email')();
    var login = 'lightsofapollo-staging';
    return subject(
      github,
      login
    ).then(function(email) {
      assert.equal(login + '@github.taskcluster.net', email);
    });
  });


});
