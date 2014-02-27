suite('project config', function() {  
  var nock = require('nock');
  var subject = require('./project_config');

  test('from disk', function() {
    var fixture = __dirname + '/test/fixtures/projects.json';

    var expected = require(fixture);

    return subject(fixture).then(function(value) {
      assert.deepEqual(value, expected);
    });
  });

  test('from s3', function() {
    // nock recording for this request
    require('./test/nock/project_config_aws');

    var path = 's3://github-treeherder/empty_config.json';
    return subject(path).then(function(obj) {
      assert.deepEqual(obj, {});
    });
  });
});
