suite('url', function() {
  var urlJoin = require('url-join');
  var subject = require('./url');

  test('#url', function() {
    var expected = '/v1/task/1/status';
    var url = subject('/v1/', 'task/%d/status', 1);
    assert.equal(expected, url);
  });
});
