suite('index', function() {
  var subject = require('./');
  var props = [
    'PullRequest',
    'PullRequestRef',
    'Link',
    'Repo',
    'User'
  ];

  props.forEach(function(key) {
    test(key, function() {
      assert.ok(subject[key].create, key + ' is a factory');
    });
  });
});
